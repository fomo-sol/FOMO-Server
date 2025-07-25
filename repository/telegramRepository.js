const pool = require("../config/db");

exports.updateTelegramId = async (userId, telegramId) => {
    try {
        const result = await pool.execute(
            `UPDATE users SET telegram_id = ? WHERE id = ?`,
            [telegramId, userId]
        );

        console.log("[REPO] UPDATE 결과:", result);

        if (result.affectedRows === 0) {
            const err = new Error("해당 사용자를 찾을 수 없습니다.");
            err.code = 404;
            throw err;
        }

        return { userId, telegram_id: telegramId };
    } catch (err) {
        console.error("[REPOSITORY ERROR] telegram_id 업데이트 실패:", err);
        throw err;
    }
};

exports.getAllTelegramSubscribers = async () => {
    try {
        const rows = await pool.query(`
            SELECT id AS userId, telegram_id
            FROM users
            WHERE telegram_id IS NOT NULL
        `);

        return rows; // 배열
    } catch (err) {
        console.error("[REPOSITORY ERROR] getAllTelegramSubscribers 실패:", err);
        throw err;
    }
};

exports.getTelegramChatIdByUserId = async (userId) => {
    try {
        const rows = await pool.query(
            `SELECT telegram_id FROM users WHERE id = ?`,
            [userId]
        );

        const chatId = rows[0]?.telegram_id;

        console.log("[DEBUG] rows:", rows);
        console.log("[DEBUG] telegram_id:", chatId);

        return chatId !== null && chatId !== undefined ? chatId : null;
    } catch (err) {
        console.error("[REPOSITORY ERROR] getTelegramChatIdByUserId 실패:", err);
        throw err;
    }
};