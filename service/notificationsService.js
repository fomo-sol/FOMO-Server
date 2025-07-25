const repo = require("../repository/notificationsRepository");

exports.fetchNotifications = async (filter, userId) => {
  if (filter === "custom") {
    // 특정 user_id의 earning_analysis / fomc_analysis 알림만 가져오기
    return await repo.getCustomAnalysisNotifications(userId);
  }

  const [userAlertsRaw, globalAlertsRaw] = await Promise.all([
    repo.getUserNotifications(userId), // 유저 전용 알림
    repo.getGlobalNotifications(), // 글로벌 알림
  ]);

  const userAlerts = Array.isArray(userAlertsRaw)
    ? userAlertsRaw
    : [userAlertsRaw];

  const globalAlerts = Array.isArray(globalAlertsRaw)
    ? globalAlertsRaw
    : [globalAlertsRaw];

  console.log("🧾 userAlerts:", userAlerts);
  console.log("🌐 globalAlerts:", globalAlerts);

  return [...userAlerts, ...globalAlerts];
};

exports.fetchLatestNotification = async () => {
  return await repo.getLatestNotification();
};
