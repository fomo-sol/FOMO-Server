const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.createUser = async (userData) => {
  const { username, email, passwd } = userData;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(passwd, saltRounds);

    // 1. INSERT
    await pool.execute(
      `INSERT INTO users (username, email, passwd) VALUES (?, ?, ?)`,
      [username, email, hashedPassword]
    );

    // 2. UUID 기반 사용자 재조회
    const [rows] = await pool.execute(
      `SELECT id, username, email FROM users WHERE username = ?`,
      [username]
    );

    return rows[0];
  } catch (err) {
    console.error("[REPOSITORY ERROR]", err);
    throw err;
  }
};

exports.findByEmail = async (email) => {
  try {
    const rows = await pool.execute(
      `SELECT id, username, email, passwd FROM users WHERE email = ?`,
      [email]
    );

    console.log("[DEBUG] rows from mariadb.execute():", rows);

    return rows[0];
  } catch (err) {
    console.error("[REPOSITORY ERROR] findByEmail 실패:", err);
    throw err;
  }
};

exports.findById = async (id) => {
  const rows = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );

  console.log("✅ userRepository 결과:", rows);

  return rows[0]; // 배열에서 첫 번째 유저
};

exports.findAllWithFcmToken = async () => {
  const rows = await pool.query(`
    SELECT id, fcm_token
    FROM users
    WHERE fcm_token IS NOT NULL
  `);
  return rows; // 배열 그대로 반환
};

// 중복 토큰 보유 사용자 조회
exports.findByFcmToken = async (token) => {
  const rows = await pool.query(
    `SELECT id FROM users WHERE fcm_token = ?`,
    [token]
  );
  return rows[0];
};

// 다른 유저의 토큰 제거
exports.removeFcmToken = async (userId) => {
  await pool.query(
    `UPDATE users SET fcm_token = NULL WHERE id = ?`,
    [userId]
  );
};

// 내 계정에 토큰 저장(갱신)
exports.saveFcmToken = async (userId, token) => {
  await pool.query(
    `UPDATE users SET fcm_token = ? WHERE id = ?`,
    [token, userId]
  );
};

// 관심 sector별 유저 조회 (sector_name으로)
exports.findUsersBySector = async (sectorName) => {
  const query = `
        SELECT u.*
        FROM users u
        JOIN user_wishlist uw ON u.id = uw.user_id
        JOIN stocks s ON uw.stock_id = s.id
        JOIN sectors sec ON s.sector_id = sec.id
        WHERE sec.sector_name = ? AND u.fcm_token IS NOT NULL
        GROUP BY u.id
    `;
  const rows = await pool.query(query, [sectorName]);
  return rows; // rows 그대로 반환 (findAllWithFcmToken 참고)
};