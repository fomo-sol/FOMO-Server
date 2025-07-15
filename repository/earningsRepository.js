
const pool = require("../config/db");

const dummyEarnings = [
    {
        id: "1",
        company_name: "Apple Inc.",
        stock_symbol: "AAPL",
        announcement_date: "2025-07-30",
        earnings_summary: "2025년 2분기 실적 발표 예정",
        favorite: true,
    },
    {
        id: "2",
        company_name: "Tesla Inc.",
        stock_symbol: "TSLA",
        announcement_date: "2025-07-28",
        earnings_summary: "매출 증가와 EPS 상승",
        favorite: false,
    },
];

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

exports.getEarningsEXCD = getEarningsEXCD;
exports.getEarningsById = getEarningsById;

exports.getAllEarnings = async () => dummyEarnings;

exports.getFavoriteEarnings = async () =>
    dummyEarnings.filter(item => item.favorite);

exports.getSortedEarnings = async () =>
    [...dummyEarnings].sort((a, b) =>
        new Date(a.announcement_date) - new Date(b.announcement_date)
    );

exports.searchEarnings = async (keyword) =>
    dummyEarnings.filter(item =>
        item.company_name.toLowerCase().includes(keyword.toLowerCase())
    );


exports.getEarningsLangContent = async (id, lang) =>
    langContent[id]?.[lang] || null;
