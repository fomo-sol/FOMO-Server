const service = require("../service/telegramService");

exports.subscribeUser = async (req, res) => {
    const result = await service.saveTelegramSubscription(req.body);
    res.json({ success: true, message: "텔레그램 구독 등록 완료", result });
};