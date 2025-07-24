const pool = require("../config/db");
exports.getUserNotifications = async (userId) => {
  const rows = await pool.execute(
    `SELECT * FROM user_alerts WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

exports.getGlobalNotifications = async () => {
  const rows = await pool.execute(
    `SELECT * FROM global_alerts ORDER BY created_at DESC`
  );
  return rows;
};

exports.getLatestNotification = async () => {
  const [rows] = await pool.execute(
    `
    SELECT * FROM (
      SELECT id, user_id, alert_content, stock_id, created_at, status 
      FROM user_alerts
      UNION ALL
      SELECT id, NULL AS user_id, alert_content, stock_id, created_at, status 
      FROM global_alerts
    ) AS combined
    ORDER BY created_at DESC
    LIMIT 15
    `
  );
  return rows;
};
exports.getAllNotifications = async () => {
  return [
    {
      id: "1",
      type: "fomc",
      message: "7월 FOMC 의사록이 공개되었습니다.",
      created_at: "2025-07-10T12:00:00Z",
    },
    {
      id: "2",
      type: "earnings",
      message: "테슬라 실적 발표가 오늘 예정되어 있습니다.",
      created_at: "2025-07-11T08:00:00Z",
    },
  ];
};

exports.getCustomAnalysisNotifications = async (userId) => {
  const rows = await pool.execute(
    `SELECT * FROM user_alerts 
     WHERE user_id = ? 
     AND status IN ('earning_analysis', 'fomc_analysis') 
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};
