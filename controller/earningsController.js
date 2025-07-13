const earningsService = require("../service/earningsService");

exports.getEarningsList = async (req, res) => {
    try {
        const data = await earningsService.fetchEarningsList(req.query);
        res.json({ success: true, data });
    } catch (err) {
        console.error("Earnings list error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getEarningsById = async (req, res) => {
    try {
        const data = await earningsService.fetchEarningsById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: "존재하지 않는 ID입니다." });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error("Earnings detail error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getEarningsLangContent = async (req, res) => {
    try {
        const { id, lang } = req.params;
        const type = req.params.type || "earnings"; // 현재는 earnings 고정

        const content = await earningsService.fetchEarningsLangContent(id, lang);
        if (!content) {
            return res.status(404).json({ success: false, message: "콘텐츠를 찾을 수 없습니다." });
        }
        res.json({ success: true, content });
    } catch (err) {
        console.error("Earnings lang content error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
