const db = require("../config/db");

// 더미 데이터
const dummyData = [
    {
        id: "1",
        fomc_minutes_name: "2025년 6월 FOMC 회의",
        fomc_release_date: "2025-06-12",
        fomc_interest_rate: 5.25,
        fomc_status: true,
        created_at: "2025-06-10T12:00:00Z",
    },
    {
        id: "2",
        fomc_minutes_name: "2025년 4월 FOMC 회의",
        fomc_release_date: "2025-04-24",
        fomc_interest_rate: 5.00,
        fomc_status: true,
        created_at: "2025-04-20T12:00:00Z",
    },
];

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