const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// 전체 조회
exports.getFavorites = async (user_id) => {
    const rows = await pool.execute(`
        SELECT uw.id, uw.user_id, uw.stock_id,
               s.stock_name AS name, s.stock_name_kr AS name_kr,
               s.stock_symbol AS symbol, s.stock_logo_img AS logo
        FROM user_wishlist uw
                 JOIN stocks s ON uw.stock_id = s.id
        WHERE uw.user_id = ?
    `, [user_id]);
    return rows;
};


exports.checkDuplicateFavorites = async (favoritesList) => {
    if (!favoritesList.length) return false;

    const conditions = favoritesList
        .map(() => `(user_id = ? AND stock_id = ?)`)
        .join(" OR ");
    const params = favoritesList.flatMap(({ user_id, stock_id }) => [user_id, stock_id]);

    const rows = await pool.execute(
        `SELECT COUNT(*) as count FROM user_wishlist WHERE ${conditions}`, params
    );

    return rows[0]?.count > 0;

};
exports.insertFavorites = async (favoritesList) => {
    if (!favoritesList || !favoritesList.length) return 0;

    const values = favoritesList.map(({ user_id, stock_id }) => [
        uuidv4(), user_id, stock_id
    ]);

    await pool.query(`
        INSERT INTO user_wishlist (id, user_id, stock_id)
        VALUES ${values.map(() => '(?, ?, ?)').join(', ')}
    `, values.flat());

    return values.length;
};

// 단일 삭제
exports.deleteFavorite = async (stock_id, user_id) => {
    await pool.execute(`
        DELETE FROM user_wishlist
        WHERE stock_id = ? AND user_id = ?
    `, [stock_id, user_id]);
    return true;
};