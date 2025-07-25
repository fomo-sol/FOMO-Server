const service = require("../service/notificationsService");
const fcmService = require("../service/fcmService");
const userRepository = require("../repository/userRepository");
const pool = require("../config/db");
const axios = require("axios");
const moment = require("moment-timezone");
const telegramService = require("../service/telegramService");
const notificationsRepository = require("../repository/notificationsRepository");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config"); // 실제 s3 client import

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
    
    // 🔸 유저별 메시지를 누적 저장: { userId => { user, sectors: [{ sector, prediction }] } }
    const userPredictionMap = new Map();

    for (const sectorObj of sectorList) {
      const { sector, prediction } = sectorObj;
      const users = await userRepository.findUsersBySector(sector);
      for (const user of users) {
        if (!userPredictionMap.has(user.id)) {
          userPredictionMap.set(user.id, {
            user,
            sectors: [],
          });
        }
        userPredictionMap.get(user.id).sectors.push({ sector, prediction });
      }
    }

    // 🔸 사용자별 1회 알림 전송
    for (const [userId, { user, sectors }] of userPredictionMap.entries()) {
      // 1. 유저 관심종목 조회
      const favorites = await userRepository.findFavoritesByUserId(userId);
      // sector별 symbol 매핑
      const sectorSymbolMap = {};
      for (const fav of favorites) {
        if (!sectorSymbolMap[fav.sector_name]) sectorSymbolMap[fav.sector_name] = [];
        sectorSymbolMap[fav.sector_name].push(fav.symbol);
      }

      // 2. 메시지 생성
      const message = sectors
        .map(item => {
          const symbols = sectorSymbolMap[item.sector] || [];
          const symbolStr = symbols.length ? ` (${symbols.join(', ')})` : '';
          return `📌 [${item.sector} 산업 전망]${symbolStr}\n${item.prediction}`;
        })
        .join("\n\n");

      // FCM
      if (user.fcm_token) {
        try {
          await fcmService.sendNotificationToToken(
            user.fcm_token,
            "📊 관심 산업 전망 알림",
            message
          );
          console.log(`✅ [FCM] ${user.username || user.id} 전송 완료`);
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
            await userRepository.removeFcmToken(user.fcm_token);
          }
        }
      }

      // DB 저장 (user_alerts)
      await notificationsRepository.insertUserAlert(user.id, message, 'fomc_analysis');

      // Telegram
      if (user.telegram_id) {
        try {
          await telegramService.sendTelegramAlert(
            user.id,
            `📊 관심 산업 전망 요약\n\n${message}`
          );
          console.log(`✅ [텔레그램] ${user.username || user.id} 전송 완료`);
        } catch (err) {
          console.error(`❌ [텔레그램] ${user.username || user.id} 전송 실패:`, err.message);
        }
      }
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

    // DB 저장 (global_alerts)
    await notificationsRepository.insertGlobalAlert(message);

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
    const year = kstDate.year();
    const month = kstDate.month() + 1;
    const day = kstDate.date();
    let typeStr = "";
    let resultStr = "";
    if (type === "statement") {
      typeStr = "금리 발표";
      resultStr = "금리 결정 결과";
    } else if (type === "minutes") {
      typeStr = "의사록 공개";
      resultStr = "의사록";
    } else {
      typeStr = type;
      resultStr = type;
    }
    // 메시지 포맷 변경
    const message = `📄 [FOMC] ${year}년 ${month}월 ${day}일 ${resultStr}가 공개되었습니다.`;

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

    // DB 저장 (global_alerts)
    await notificationsRepository.insertGlobalAlert(message);

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

// 실적발표 하루 전 알림
exports.notifyEarningsPreAlarm = async (req, res) => {
  console.log("[DEBUG] req.body:", req.body);
  const { date, stock_id, symbol } = req.body;
  if (!date || !stock_id || !symbol) {
    return res.status(400).json({ success: false, message: "date, stock_id, symbol 필요" });
  }

  try {
    const users = await userRepository.findUsersByStockId(stock_id);
    console.log("[DEBUG] 알림 대상 유저:", users);

    if (!users || users.length === 0) {
      console.log("[DEBUG] 알림 대상 유저가 없습니다.");
      return res.json({ success: true, message: "알림 대상 유저 없음" });
    }

    // 알림 메시지 포맷 개선
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const message = `📢 [D-1 알림] 내일(${month}/${day}) ${symbol}의 실적 발표가 예정되어 있습니다.`;

    for (const user of users) {
      // FCM
      if (user.fcm_token) {
        try {
          console.log("[DEBUG] FCM 전송 대상:", user.fcm_token);
          await fcmService.sendNotificationToToken(user.fcm_token, "실적 발표 알림", message);
        } catch (err) {
          console.error("[ERROR] FCM 전송 실패:", err.message);
        }
      }
      // 텔레그램
      if (user.telegram_id) {
        try {
          console.log("[DEBUG] 텔레그램 전송 대상:", user.telegram_id);
          await telegramService.sendTelegramAlert(user.id, message);
        } catch (err) {
          console.error("[ERROR] 텔레그램 전송 실패:", err.message);
        }
      }
      // DB 저장 (user_alerts)
      try {
        await notificationsRepository.insertUserAlert(user.id, message, 'earning_global', stock_id);
      } catch (err) {
        console.error("[ERROR] user_alerts 저장 실패:", err.message);
      }
    }

    res.json({ success: true, message: "실적발표 하루 전 알림 전송 완료" });
  } catch (err) {
    console.error("[ERROR] notifyEarningsPreAlarm:", err);
    res.status(500).json({ success: false, message: "서버 오류", error: err.message });
  }
};

exports.notifyEarningsSummaryUpload = async (req, res) => {
  const { symbol, date } = req.body;
  if (!symbol || !date) {
    return res.status(400).json({ success: false, message: "symbol, date 필요" });
  }

  try {
    // 1. S3에서 요약 읽기
    const s3Key = `industry_analysis/${symbol}/${date}.json`;
    let prediction = "요약 없음";
    let message = ""; // 추가

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
      });
      const response = await s3.send(command);
      const streamToBuffer = (stream) => {
        return new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        });
      };
      const buffer = await streamToBuffer(response.Body);
      const jsonText = buffer.toString("utf-8");
      console.log("📄 S3 JSON 내용:", jsonText);

      let summary = JSON.parse(jsonText);
      if (typeof summary === "string") {
        console.log("⚠️  summary가 문자열이므로 2차 파싱 시도");
        summary = JSON.parse(summary);
      }

      console.log("📦 Parsed JSON:", summary);
      prediction = summary.prediction;
      message = `📄 [${symbol}] ${date} 실적 요약이 업로드되었습니다.\n\n💬 요약: ${prediction}`;
    } catch (err) {
      console.error("[ERROR] S3 요약 읽기 실패:", err);
    }

    // 2. 알림 대상 유저 조회
    const users = await userRepository.findUsersBySymbol(symbol);
    if (!users || users.length === 0) {
      console.log("[DEBUG] 알림 대상 유저가 없습니다.");
      return res.json({ success: true, message: "알림 대상 유저 없음" });
    }

    for (const user of users) {
      // FCM
      if (user.fcm_token) {
        try {
          await fcmService.sendNotificationToToken(user.fcm_token, "실적 요약 업로드", message);
        } catch (err) {
          console.error("[ERROR] FCM 전송 실패:", err.message);
        }
      }
      // 텔레그램
      if (user.telegram_id) {
        try {
          await telegramService.sendTelegramAlert(user.id, message);
        } catch (err) {
          console.error("[ERROR] 텔레그램 전송 실패:", err.message);
        }
      }
      // DB 저장 (user_alerts)
      try {
        let stockId = null;
        try {
          const stockRow = await userRepository.findStockIdBySymbol(symbol);
          stockId = stockRow ? stockRow.id : null;
        } catch (err) {
          console.error("[ERROR] stock_id 조회 실패:", err);
        }
        await notificationsRepository.insertUserAlert(user.id, message, 'earning_analysis', stockId);
      } catch (err) {
        console.error("[ERROR] user_alerts 저장 실패:", err.message);
      }
    }

    res.json({ success: true, message: "실적발표 요약 업로드 알림 전송 완료" });
  } catch (err) {
    console.error("[ERROR] notifyEarningsSummaryUpload:", err);
    res.status(500).json({ success: false, message: "서버 오류", error: err.message });
  }
};
