const pool = require("../config/db");


async function getStockIdBySymbol(symbol) {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query(
            `
                SELECT id
                FROM stocks
                WHERE stock_symbol = ? LIMIT 1
            `,
            [symbol]
        );
        conn.release(); // 연결 해제 꼭 필요

        if (rows.length === 0) {
            throw new Error(`Symbol not found: ${symbol}`);
        }

        return rows;
    } catch (err) {
        console.error("not found symbol id", err);
        throw err;
    }
}


async function getStockFinancesByStockId(stockId) {
    try {
        const conn = await pool.getConnection();

        const rows = await conn.query(
            `
            SELECT 
                id,
                stock_id,
                fin_release_date,
                fin_period_date,
                fin_eps_value,
                fin_eps_forest,
                fin_revenue_value,
                fin_revenue_forest,
                fin_info_name
            FROM stock_finances
            WHERE stock_id = ?
            ORDER BY fin_release_date DESC
            LIMIT 2
            `,
            [stockId]
        );

        conn.release();
        return rows;

    } catch (err) {
        console.error("getStockFinancesByStockId DB Error:", err);
        throw err;
    }
}

const getEarningsDetailFinanceById = async (earningFinance) => {
    try {
        // 여러 기업 정보를 순회하며 각각 최신 2개 재무 데이터를 가져옴
        const results = await Promise.all(
            earningFinance.map(async (stock) => {
                const stockId = stock.id;

                // 예: DB 쿼리 or API 요청
                const finances = await getStockFinancesByStockId(stockId);

                // 최신 fin_release_date 기준 정렬 후 상위 2개만 추출
                const sortedFinances = finances
                    .sort((a, b) => new Date(b.fin_release_date) - new Date(a.fin_release_date))
                    .slice(0, 2);

                return {
                    ...stock,
                    finances: sortedFinances,
                };
            })
        );

        return results;
    } catch (err) {
        console.error("getEarningsDetailFinanceById err", err);
        throw err;
    }
};


const getEarningsById = async (id) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT
                 s.id,
                 s.stock_name,
                 s.stock_name_kr,
                 s.stock_symbol,
                 s.stock_cik,
                 s.stock_excd,
                 s.stock_rank,
                 s.stock_logo_img,
                 s.sector_id,
                 s.industry_id,
                 sf.id AS finance_id,
                 sf.fin_release_date,
                 sf.fin_period_date,
                 sf.fin_eps_value,
                 sf.fin_eps_forest,
                 sf.fin_revenue_value,
                 sf.fin_revenue_forest,
                 sf.fin_info_name,
                 sf.created_at
             FROM stocks s
                      LEFT JOIN stock_finances sf ON s.id = sf.stock_id
             WHERE s.id = '${id}';
            `,
            [id]
        );
        conn.release();

        const stock = {
            id: rows[0].id,
            stock_name: rows[0].stock_name,
            stock_name_kr: rows[0].stock_name_kr,
            stock_symbol: rows[0].stock_symbol,
            stock_cik: rows[0].stock_cik,
            stock_excd: rows[0].stock_excd,
            stock_rank: rows[0].stock_rank,
            stock_logo_img: rows[0].stock_logo_img,
            sector_id: rows[0].sector_id,
            industry_id: rows[0].industry_id,
        };

        const finances = rows.map(row => ({
            id: row.finance_id,
            fin_release_date: row.fin_release_date,
            fin_period_date: row.fin_period_date,
            fin_eps_value: row.fin_eps_value,
            fin_eps_forest: row.fin_eps_forest,
            fin_revenue_value: row.fin_revenue_value,
            fin_revenue_forest: row.fin_revenue_forest,
            fin_info_name: row.fin_info_name,
            created_at: row.created_at,
        }));
        return {stock, finances};

    } catch (err) {
        console.error("getEarningsById error:", err);
        throw err;
    }
};


const getStocksOrderRankedByOffset = async (limit, offset) => {
    const conn = await pool.getConnection();

    try {
        const rows = await conn.query(
            `
            SELECT
                s.id,
                s.stock_name AS name,
                s.stock_name_kr AS name_kr,
                s.stock_symbol AS symbol,
                s.stock_rank AS rank,
                s.stock_logo_img AS logo,
                sec.sector_name AS sector,
                ind.industries_name AS industry
            FROM stocks s
            JOIN sectors sec ON s.sector_id = sec.id
            JOIN industries ind ON s.industry_id = ind.id
            ORDER BY s.stock_rank ASC
            LIMIT ? OFFSET ?
            `,
            [limit, offset]
        );
        conn.release();
        return rows;
    } catch (err) {
        console.error("getStocksOrderRankedByOffset error:", err);
        throw err;
    } finally {
        conn.release();
    }
};


const getEarningsEXCD = async (symbol) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT stock_excd FROM stocks WHERE stock_symbol = ?",
            [symbol]
        );
        conn.release();

        if (rows.length > 0) {
            return rows[0].stock_excd;
        } else {
            throw new Error("Symbol not found");
        }
    } catch (err) {
        console.error("getEarningsEXCD error:", err);
        throw err;
    }
};


const langContent = {
    "1": {
        ko: "애플 2025년 2분기 실적 발표 예정 (한국어)",
        en: "Apple Q2 2025 earnings announcement (English)",
        summary: "AI 요약: 예상보다 높은 EPS 발표 가능성",
    },
    "2": {
        ko: "테슬라 2025년 2분기 실적 (한국어)",
        en: "Tesla Q2 2025 earnings (English)",
        summary: "AI 분석: 시장 기대 상회",
    },
};

exports.getStockIdBySymbol = getStockIdBySymbol;
exports.getEarningsEXCD = getEarningsEXCD;
exports.getEarningsById = getEarningsById;
exports.getStocksOrderRankedByOffset = getStocksOrderRankedByOffset;
exports.getEarningsDetailFinanceById = getEarningsDetailFinanceById;
exports.getEarningsLangContent = async (id, lang) =>
    langContent[id]?.[lang] || null;
