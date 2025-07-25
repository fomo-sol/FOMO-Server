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

exports.insertGlobalAlert = async (alert_content) => {
    const query = `INSERT INTO global_alerts (alert_content) VALUES (?)`;
    await pool.query(query, [alert_content]);
};

exports.insertUserAlert = async (user_id, alert_content, status = 'fomc_analysis', stock_id = null) => {
    const query = `INSERT INTO user_alerts (user_id, alert_content, status, stock_id) VALUES (?, ?, ?, ?)`;
    await pool.query(query, [user_id, alert_content, status, stock_id]);
};

