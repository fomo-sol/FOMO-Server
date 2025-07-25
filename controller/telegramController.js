const telegramService = require("../service/telegramService");
const STATUS = require("../common/status");

exports.subscribeTelegram = async (req, res) => {
  console.log("[API] /api/telegram/subscribe 요청 수신:", req.body);
  try {
    const { userId, telegram_id } = req.body;

    if (!userId || !telegram_id) {
      return res.status(400).json({
        message: "userId와 telegram_id는 필수입니다.",
      });
    }

    const result = await telegramService.subscribeTelegram({
      userId,
      telegram_id,
    });

    console.log("[CONTROLLER] 텔레그램 ID 등록 성공:", result);

    res.status(STATUS.SUCCESS.code).json({
      message: "텔레그램 ID가 성공적으로 등록되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error("[CONTROLLER ERROR]", error.message);

    // 중복 에러 처리
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "이미 등록된 텔레그램입니다.",
      });
    }

    // 에러 코드가 숫자가 아니면 500으로 처리
    const status = typeof error.code === "number" ? error.code : 500;
    res.status(status).json({
      message: error.message || "서버 오류",
    });
  }
};
