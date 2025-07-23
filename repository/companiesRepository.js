const pool = require("../config/db");

// 전체 기업 목록 조회
exports.getAllCompanies = async () => {
    try {
        const rows = await pool.execute(`
            SELECT 
                s.id,
                s.stock_name AS name,
                s.stock_name_kr AS name_kr,
                s.stock_symbol AS symbol,
                s.stock_logo_img AS logo,
                sec.sector_name AS sector,
                ind.industries_name AS industry
            FROM stocks s
            JOIN sectors sec ON s.sector_id = sec.id
            JOIN industries ind ON s.industry_id = ind.id
            ORDER BY s.stock_rank ASC
        `);

        return rows;
    } catch (err) {
        console.error("getAllCompaney error:", err);
        throw err;
    }
};

// 기업 검색
exports.searchCompanies = async (keyword) => {
    try {
    const rows = await pool.execute(`
        SELECT 
            s.id,
            s.stock_name AS name,
            s.stock_name_kr AS name_kr,
            s.stock_symbol AS symbol,
            s.stock_logo_img AS logo,
            sec.sector_name AS sector,
            ind.industries_name AS industry
        FROM stocks s
        JOIN sectors sec ON s.sector_id = sec.id
        JOIN industries ind ON s.industry_id = ind.id
        WHERE 
            s.stock_name LIKE ? OR 
            s.stock_name_kr LIKE ? OR 
            s.stock_symbol LIKE ?
        ORDER BY s.stock_rank ASC
    `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
    return rows;
    } catch (err) {
        console.error("getSearchCompany error:", err);
        throw err;
    }
};
