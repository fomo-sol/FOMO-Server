const pool = require("../config/db");
// const externalData = require('./stock.json');

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
                s.stock_rank AS rank,
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

// exports.getStockData = async () => {
//     try {
//         const rows = await pool.execute(`
//               SELECT
//         s.*,
//         sf.fin_release_date,
//         sf.fin_period_date,
//         sf.fin_eps_value,
//         sf.fin_eps_forest,
//         sf.fin_revenue_value,
//         sf.fin_revenue_forest,
//         sf.fin_info_name,
//         sf.fin_hour,
//         sf.created_at AS finance_created_at
//       FROM stocks s
//       LEFT JOIN stock_finances sf ON sf.stock_id = s.id
//       AND sf.fin_release_date = (
//         SELECT MAX(fin_release_date)
//         FROM stock_finances
//         WHERE stock_id = s.id
//       )
//         `)
//
//         return rows;
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// }
//
// const validHours = ['bmo', 'amc', 'dmt'];
//
// exports.updateData = async () => {
//     try {
//         for (const item of externalData) {
//             const { symbol, hour, date } = item;
//
//             if (!validHours.includes(hour)) {
//                 console.warn(`⚠️ ${symbol} ${date} - fin_hour 값이 유효하지 않습니다: '${hour}', 업데이트 건너뜁니다.`);
//                 continue;
//             }
//
//             const finReleaseDate = new Date(date).toISOString().split('T')[0];
//
//             const result = await pool.execute(
//                 `
//         UPDATE stock_finances sf
//         JOIN stocks s ON sf.stock_id = s.id
//         SET sf.fin_hour = ?
//         WHERE s.stock_symbol = ? AND sf.fin_release_date = ?
//         `,
//                 [hour, symbol, finReleaseDate]
//             );
//
//             if (result.affectedRows > 0) {
//                 console.log(`✅ ${symbol} ${finReleaseDate} fin_hour updated to '${hour}'`);
//             } else {
//                 console.log(`⚠️ ${symbol} ${finReleaseDate} 해당 레코드 없음`);
//             }
//         }
//     } catch (err) {
//         console.error("updateData error:", err);
//         throw err;
//     }
// };

// 기업 검색
exports.searchCompanies = async (keyword) => {
  try {
    const rows = await pool.execute(
      `
        SELECT 
            s.id,
            s.stock_name AS name,
            s.stock_name_kr AS name_kr,
            s.stock_symbol AS symbol,
            s.stock_logo_img AS logo,
            s.stock_rank AS rank,
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
    `,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
  } catch (err) {
    console.error("getSearchCompany error:", err);
    throw err;
  }
};
