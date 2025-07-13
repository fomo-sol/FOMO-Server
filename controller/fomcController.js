const fomcService = require("../service/fomcService");

exports.getFomcList = async (req, res) => {
    try {
        const data = await fomcService.getFomcList();
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("FOMC 목록 조회 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getFomcById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await fomcService.getFomcDetailById(id);

        if (!data) {
            return res.status(404).json({ success: false, message: "존재하지 않는 FOMC ID입니다" });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("FOMC 상세 조회 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
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