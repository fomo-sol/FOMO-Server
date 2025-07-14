const pool = require("../config/db");

exports.updateTelegramId = async (userId, telegramId) => {
    try {
        const result = await pool.execute(
            `UPDATE users SET telegram_id = ? WHERE id = ?`,
            [telegramId, userId]
        );

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
