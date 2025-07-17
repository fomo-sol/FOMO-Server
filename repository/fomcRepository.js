const pool = require("../config/db");

async function getFomcMinute({year}) {
    try {
        console.log(year)
        const conn = await pool.getConnection();
        const query = `
            SELECT *
            FROM fomc_minutes
            WHERE YEAR(fomc_release_date) = ?
            ORDER BY fomc_release_date ASC
        `;
        const rows = await conn.query(query, [year]);
        conn.release();
        return rows;
    } catch (err) {
        console.error("Error fetching FOMC getFomcMinutes", err);
        throw err;
    }
}

async function getFomcDecision({year}) {
    try {
        const conn = await pool.getConnection();

        const query = `
            SELECT *
            FROM fomc_rate_decisions
            WHERE YEAR(fed_release_date) = ?
            ORDER BY fed_release_date ASC
        `;
        const rows = await conn.query(query, [year]);
        conn.release();
        return rows;
    } catch (err) {
        console.error('Error fetching FOMC decisions:', err);
        throw err;
    }
}

// 더미 데이터
const rateContent = {
    "1": {
        ko: "2025년 6월 기준금리 발표문 (한국어)",
        en: "June 2025 Rate Statement (English)",
        summary: "AI 요약: 시장 중립적인 금리 동결 발표",
    },
};

const minutesContent = {
    "1": {
        ko: "2025년 6월 의사록 (한국어 번역)",
        en: "FOMC Minutes June 2025 (English)",
        summary: "AI 분석: 인플레이션 완화 신호 포착",
    },
};

exports.fetchFomcTypeContent = async (id, type) => {
    let base = null;
    if (type === "rate") base = rateContent;
    if (type === "minutes") base = minutesContent;

    return base?.[id] || null;
};

exports.fetchFomcContentByLang = async (id, type, lang) => {
    let base = null;
    if (type === "rate") base = rateContent;
    if (type === "minutes") base = minutesContent;

    const contentSet = base?.[id];
    return contentSet?.[lang] || null;
};

exports.getFomcMinute = getFomcMinute;
exports.getFomcDecision = getFomcDecision;