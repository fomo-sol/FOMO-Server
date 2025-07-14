
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

exports.getEarningsById = async (id) =>
    dummyEarnings.find(item => item.id === id);

exports.getEarningsLangContent = async (id, lang) =>
    langContent[id]?.[lang] || null;
