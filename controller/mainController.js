const mainService = require("../service/mainService");

exports.getMain = async (req, res) => {
    try {
        const data = await mainService.getMainData();
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("메인 컨트롤러 오류:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
