const repo = require("../repository/notificationsRepository");

exports.fetchNotifications = async (filter) => {
    if (filter === "custom") {
        return await repo.getCustomNotifications();
    }

    return await repo.getAllNotifications();
};

exports.fetchLatestNotification = async () => {
    return await repo.getLatestNotification();
};
