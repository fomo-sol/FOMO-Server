const navService = require("../service/navService");

exports.getHeaderNav = async (req, res) => {
    try {
        const data = await navService.fetchHeaderNav();
        res.json({ success: true, data });
    } catch (error) {
        console.error("Header nav error:", error);
        res.status(500).json({ success: false, message: "상단 네비게이션 조회 실패" });
    }
};

exports.getFomcNav = async (req, res) => {
    try {
        const data = await navService.fetchFomcNav();
        res.json({ success: true, data });
    } catch (error) {
        console.error("FOMC nav error:", error);
        res.status(500).json({ success: false, message: "FOMC 네비게이션 조회 실패" });
    }
};

exports.getEarningsNav = async (req, res) => {
    try {
        const data = await navService.fetchEarningsNav();
        res.json({ success: true, data });
    } catch (error) {
        console.error("Earnings nav error:", error);
        res.status(500).json({ success: false, message: "실적발표 네비게이션 조회 실패" });
    }
};