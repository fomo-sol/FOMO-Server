const service = require("../service/notificationsService");
const fcmService = require("../service/fcmService");
const userRepository = require("../repository/userRepository");
const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
    const filter = req.query.filter || "all";
    const data = await service.fetchNotifications(filter);
    res.json({ success: true, data });
};

exports.getLatestNotification = async (req, res) => {
    const data = await service.fetchLatestNotification();
    res.json({ success: true, data });
};

exports.sendTestNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        console.log("✅ 요청한 유저 ID:", userId);

        const user = await userRepository.findById(userId);
        if (!user || !user.fcm_token) {
            return res.status(400).json({ success: false, message: "FCM 토큰이 없습니다." });
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