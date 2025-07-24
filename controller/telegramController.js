const telegramService = require("../service/telegramService");
const STATUS = require("../common/status");

exports.subscribeTelegram = async (req, res) => {
    try {
        const { userId, telegram_id } = req.body;

        if (!userId || !telegram_id) {
            return res.status(400).json({
                message: "userId와 telegram_id는 필수입니다.",
            });
        }

        const result = await telegramService.subscribeTelegram({ userId, telegram_id });

        console.log("[CONTROLLER] 텔레그램 ID 등록 성공:", result);

        res.status(STATUS.SUCCESS.code).json({
            message: "텔레그램 ID가 성공적으로 등록되었습니다.",
            data: result,
        });
    } catch (error) {
        console.error("[CONTROLLER ERROR]", error.message);
        res.status(error.code || 500).json({
            message: error.message || "서버 오류",
        });
    }
};
