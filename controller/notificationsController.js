const service = require("../service/notificationsService");
const fcmService = require("../service/fcmService");
const userRepository = require("../repository/userRepository");
const pool = require("../config/db");
const axios = require("axios");
const moment = require("moment-timezone");
const telegramService = require("../service/telegramService");

exports.getNotifications = async (req, res) => {
  const filter = req.query.filter || "all";
  const userId = req.query.userId;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId is required" });
  }

  try {
    const allNotifications = await service.fetchNotifications(filter, userId);
    return res.status(200).json({
      success: true,
      data: allNotifications,
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getLatestNotification = async (req, res) => {
  try {
    const latest = await service.fetchLatestNotification();
    return res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (err) {
    console.error("getLatestNotification error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("✅ 요청한 유저 ID:", userId);

    const user = await userRepository.findById(userId);
    if (!user || !user.fcm_token) {
      return res
        .status(400)
        .json({ success: false, message: "FCM 토큰이 없습니다." });
    }

    await fcmService.sendNotificationToToken(
      user.fcm_token,
      "🔔 FCM 테스트",
      "첫 번째 푸시!"
    );

    return res.json({ success: true, message: "푸시 알림 전송 완료" });
  } catch (err) {
    console.error("[ERROR] FCM 푸시 실패:", err);
    next(err);
  }
};

exports.notifyByStatementDate = async (req, res, next) => {
  const { date, type } = req.body;
  if (!date || !type) {
    return res
      .status(400)
      .json({ success: false, message: "date와 type 값이 필요합니다." });
  }

  // KST(Asia/Seoul) 기준으로 날짜 변환
  const yyyymmdd = moment.tz(date, "Asia/Seoul").format("YYYYMMDD");
  const s3Url = `https://pda-fomo-s3.s3.ap-northeast-2.amazonaws.com/industry_analysis/${type}/${yyyymmdd}.json`;

  console.log("🌐 S3 JSON 파일 접근 URL:", s3Url);

  try {
    const { data: rawData } = await axios.get(s3Url);
    console.log(
      "📦 원본 응답 (문자열):",
      typeof rawData,
      rawData.slice(0, 100)
    );

    const sectorList = JSON.parse(rawData);
    if (!Array.isArray(sectorList)) {
      console.error("❌ sectorList 파싱 후 배열 아님:", sectorList);
      return res
        .status(500)
        .json({ success: false, message: "산업 데이터 형식 오류" });
    }

    console.log(
      "📦 파싱된 sector 리스트:",
      sectorList.map((s) => s.sector)
    );

    for (const sectorObj of sectorList) {
      const { sector, prediction } = sectorObj;

      const users = await userRepository.findUsersBySector(sector);
      console.log(`👥 [${sector}] 관심 유저 수: ${users.length}`);

      for (const user of users) {
        if (!user.fcm_token) {
          console.log(`⚠️ ${user.username || user.id}는 fcm_token이 없음`);
          continue;
        }

        try {
          console.log(`📨 ${user.username || user.id}에게 알림 발송 시도...`);
          const result = await fcmService.sendNotificationToToken(
            user.fcm_token,
            `[${sector}] 산업 전망`,
            prediction
          );
          console.log(`✅ ${user.username || user.id} 전송 완료`, result);
        } catch (err) {
          console.error(
            `❌ ${user.username || user.id} 전송 실패:`,
            err.message
          );

          // 유효하지 않은 토큰일 경우 삭제
          if (
            err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-registration-token"
          ) {
            console.warn(`🧹 ${user.username || user.id}의 토큰 삭제 처리`);
            await userRepository.removeFcmToken(user.fcm_token);
          }
        }
      }
      // 텔레그램 브로드캐스트: sector별 prediction을 그대로 전송
      await telegramService.broadcastTelegramAlert(
        `[${sector}] 산업 전망\n${prediction}`
      );
    }

    res.json({ success: true, message: "알림 전송 완료" });
  } catch (err) {
    console.error("[ERROR] notifyByStatementDate:", err);
    next(err);
  }
};

// FOMC 미리 알림 (일주일 전, 전날)
exports.notifyFomcPreAlarm = async (req, res, next) => {
  const { date, type, state, time } = req.body;
  if (!date || !type || !state) {
    return res
      .status(400)
      .json({ success: false, message: "date, type, state 값이 필요합니다." });
  }

  try {
    // 1. 알림 메시지 생성
    // type: statement, minutes 등
    // state: one_week_before, one_day_before
    // date: 발표일 (YYYY-MM-DD)
    const moment = require("moment-timezone");
    const kstDate = moment.tz(date, "Asia/Seoul");
    const dateStr = kstDate.format("YYYY년 M월 D일");
    let typeStr = "";
    let message = "";
    const timeStr = time ? time : "";

    if (type === "statement") {
      typeStr = "금리 발표";
    } else if (type === "minutes") {
      typeStr = "의사록 공개";
    } else {
      typeStr = type;
    }

    if (state === "one_week_before") {
      message = `[D-7] ${dateStr} ${timeStr}에 ${typeStr}가 예정되어 있습니다.`;
    } else if (state === "one_day_before") {
      message = `[D-1] ${dateStr} ${timeStr}에 ${typeStr}가 예정되어 있습니다.`;
    } else {
      message = `${dateStr} ${timeStr}에 ${typeStr}가 예정되어 있습니다.`;
    }

    // 2. 모든 fcm_token이 있는 유저 조회
    const users = await userRepository.findAllWithFcmToken();
    const sent = [];
    const failed = [];

    for (const user of users) {
      try {
        const result = await fcmService.sendNotificationToToken(
          user.fcm_token,
          `FOMC 예정 알림`,
          message
        );
        sent.push({ user_id: user.id, username: user.username, result });
      } catch (err) {
        failed.push({
          user_id: user.id,
          username: user.username,
          error: err.message,
        });
      }
    }

    // 텔레그램 브로드캐스트
    await telegramService.broadcastTelegramAlert(message);

    res.json({
      success: true,
      message: "FOMC 예정 알림 전송 완료",
      alarm_message: message,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[ERROR] notifyFomcPreAlarm:", err);
    res.status(500).json({
      success: false,
      message: "FOMC 예정 알림 전송 중 서버 오류",
      error: err.message,
    });
  }
};

// FOMC 업로드 알림 (업로드 시점에 전체 유저에게 알림)
exports.notifyFomcUploadAlarm = async (req, res, next) => {
  const { date, type } = req.body;
  if (!date || !type) {
    return res
      .status(400)
      .json({ success: false, message: "date, type 값이 필요합니다." });
  }

  try {
    const moment = require("moment-timezone");
    const kstDate = moment.tz(date, "Asia/Seoul");
    const dateStr = kstDate.format("YYYY년 M월 D일");
    let typeStr = "";
    if (type === "statement") {
      typeStr = "금리 발표";
    } else if (type === "minutes") {
      typeStr = "의사록 공개";
    } else {
      typeStr = type;
    }
    // 메시지 포맷 변경: '{dateStr}의 FOMC {typeStr}가 업로드되었습니다.'
    const message = `${dateStr}의 FOMC ${typeStr}가 업로드되었습니다.`;

    // FCM 전송
    const users = await userRepository.findAllWithFcmToken();
    const sent = [];
    const failed = [];

    for (const user of users) {
      try {
        const result = await fcmService.sendNotificationToToken(
          user.fcm_token,
          `[FOMC] 업로드 알림`,
          message
        );
        sent.push({ user_id: user.id, username: user.username, result });
      } catch (err) {
        failed.push({
          user_id: user.id,
          username: user.username,
          error: err.message,
        });
      }
    }

    // 텔레그램 브로드캐스트
    await telegramService.broadcastTelegramAlert(message);

    res.json({
      success: true,
      message: "FOMC 업로드 알림 전송 완료",
      alarm_message: message,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[ERROR] notifyFomcUploadAlarm:", err);
    res.status(500).json({
      success: false,
      message: "FOMC 업로드 알림 전송 중 서버 오류",
      error: err.message,
    });
  }
};
