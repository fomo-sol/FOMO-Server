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