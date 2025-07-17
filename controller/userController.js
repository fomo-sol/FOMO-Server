const userService = require("../service/userService");
const STATUS = require("../common/status");

exports.register = async (req, res) => {
    console.log("[CONTROLLER] req.body:", req.body);

    try {
        const newUser = await userService.register(req.body);
        console.log("[CONTROLLER] 회원가입 완료:", newUser);

        res.status(STATUS.SUCCESS.code).json({
            message: STATUS.SUCCESS.message,
            data: newUser,
        });
    } catch (error) {
        console.error("[CONTROLLER ERROR]", error);

        res.status(STATUS.INTERNAL_ERROR.code).json({
            message: error.message || STATUS.INTERNAL_ERROR.message,
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { user, token } = await userService.loginUser(req.body);

        res.status(200).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        console.error("[CONTROLLER LOGIN ERROR]", error.message);
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "로그인 실패",
        });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "로그아웃 성공. 클라이언트에서 토큰 삭제 필요.",
        });
    } catch (error) {
        console.error("[CONTROLLER LOGOUT ERROR]", error.message);
        res.status(500).json({ success: false, message: "로그아웃 실패" });
    }
};

exports.getUserInfo = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
};

exports.registerFcmToken = async (req, res, next) => {
    try {
        const user_id = req.user?.id;
        const { token } = req.body;

        if (!user_id || !token) {
            console.warn("[WARN] user_id 또는 token 누락:", req.user, token);
            return res.status(400).json({
                success: false,
                message: "user_id와 token은 필수입니다.",
            });
        }

        console.log("[DEBUG] FCM 토큰 등록 요청:", user_id, token);
        console.log("🔍 저장 전 확인:", user_id, token);

        await userService.saveFcmToken(user_id, token);

        return res.status(200).json({
            success: true,
            message: "FCM 토큰이 등록되었습니다.",
        });
    } catch (err) {
        console.error("[CONTROLLER ERROR] registerFcmToken 실패:", err.stack || err);
        next(err);
    }
};