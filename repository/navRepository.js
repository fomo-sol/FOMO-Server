// repository/navRepository.js

// 상단 네비게이션: 환율 + 주요 종목 호가
exports.getHeaderNav = async () => {
    return {
        exchangeRate: {
            usd_krw: 1375.12,
            jpy_krw: 915.34,
        },
        majorStocks: [
            { symbol: "AAPL", price: 215.32, change: +1.23 },
            { symbol: "TSLA", price: 255.18, change: -3.52 },
        ],
    };
};

// 좌측 FOMC 네비게이션
exports.getFomcNav = async () => {
    return [
        { id: "1", name: "2025년 6월 FOMC", date: "2025-06-12" },
        { id: "2", name: "2025년 4월 FOMC", date: "2025-04-24" },
    ];
};

// 좌측 실적발표 네비게이션: 전체 + 관심 종목 구분
exports.getEarningsNav = async () => {
    return {
        favorite: [
            { id: "apple", name: "Apple Inc.", date: "2025-07-25" },
        ],
        upcoming: [
            { id: "tsla", name: "Tesla Inc.", date: "2025-07-28" },
            { id: "meta", name: "Meta Platforms", date: "2025-08-02" },
        ],
    };
};