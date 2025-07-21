const fomcService = require("../service/fomcService");

// /api/fomc/minutes  //fomc 의사록
exports.getFomcMinutesList = async function (req, res) {
    try {
        const year = req.query.year;
        if (!year) {
            return res.status(400).json({ success: false, message: "year 파라미터가 필요합니다." });
        }
        const data = await fomcService.getFomcMinutesList(year);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("FOMC 의사록 조회 오류", err);
    }
}

// /api/fomc/decisions   //fomc 결정 성명서
exports.getFomcDecisionsList = async function (req, res) {
    try {
        const year = req.query.year;
        if (!year) {
            return res.status(400).json({ success: false, message: "year 파라미터가 필요합니다." });
        }
        const data = await fomcService.getFomcDecisionsList(year);
        res.status(200).json({success: true, data});
    } catch (err) {
        console.error("FOMC 결정 조회")
    }
};

exports.getFomcType = async (req, res) => {
    const { id, type } = req.params;

    if (!["rate", "minutes"].includes(type)) {
        return res.status(400).json({ success: false, message: "유효하지 않은 type입니다" });
    }

    try {
        const data = await fomcService.getFomcTypeContent(id, type);

        if (!data) {
            return res.status(404).json({ success: false, message: "데이터가 없습니다" });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("FOMC 하위 콘텐츠 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getFomcContentByLang = async (req, res) => {
    const { id, type, lang } = req.params;

    if (!["rate", "minutes"].includes(type)) {
        return res.status(400).json({ success: false, message: "유효하지 않은 type입니다" });
    }

    if (!["ko", "en", "summary"].includes(lang)) {
        return res.status(400).json({ success: false, message: "유효하지 않은 lang입니다" });
    }

    try {
        const data = await fomcService.getFomcContentByLang(id, type, lang);

        if (!data) {
            return res.status(404).json({ success: false, message: "데이터 없음" });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("언어별 콘텐츠 조회 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};