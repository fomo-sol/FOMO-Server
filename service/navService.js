const navRepo = require("../repository/navRepository");

// 상단 환율 + 주요 종목
exports.fetchHeaderNav = async () => {
    return await navRepo.getHeaderNav();
};

// 좌측 FOMC 리스트
exports.fetchFomcNav = async () => {
    return await navRepo.getFomcNav();
};

// 좌측 실적발표 리스트 + 관심 종목
exports.fetchEarningsNav = async () => {
    return await navRepo.getEarningsNav();
};