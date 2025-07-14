const service = require("../service/notificationsService");

exports.getNotifications = async (req, res) => {
    const filter = req.query.filter || "all";
    const data = await service.fetchNotifications(filter);
    res.json({ success: true, data });
};

exports.getLatestNotification = async (req, res) => {
    const data = await service.fetchLatestNotification();
    res.json({ success: true, data });
};