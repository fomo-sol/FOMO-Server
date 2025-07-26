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

    // 중복 이메일 에러 처리
    if (
      error.code === "ER_DUP_ENTRY" &&
      error.sqlMessage &&
      error.sqlMessage.includes("email")
    ) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    // 기타 에러
    res.status(STATUS.INTERNAL_ERROR.code).json({
      success: false,
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
  try {
    const userId = req.user.id;
    const user = await userService.getUserInfo(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "유저 정보 조회 실패" });
  }
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

    // FCM 토큰 갱신 (로그인 시)
    await userService.saveFcmToken(user_id, token);

    return res.status(200).json({
      success: true,
      message: "FCM 토큰이 등록되었습니다.",
    });

    // 중복 검사: 이미 등록된 토큰이 있다면 → 다른 유저의 토큰 삭제
    const existing = await userService.findUserByFcmToken(token);
    if (existing && existing.id !== user_id) {
      console.warn(
        "⚠️ 중복 토큰 발견 → 기존 유저의 FCM 토큰 제거:",
        existing.id
      );
      await userService.removeFcmToken(existing.id);
    }
  } catch (err) {
    console.error(
      "[CONTROLLER ERROR] registerFcmToken 실패:",
      err.stack || err
    );
    next(err);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "토큰이 제공되지 않았습니다.",
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    console.log("[CONTROLLER] 토큰 갱신 요청:", token.substring(0, 20) + "...");

    const { user, token: newToken } = await userService.refreshToken(token);

    res.status(200).json({
      success: true,
      message: "토큰이 성공적으로 갱신되었습니다.",
      data: { user, token: newToken },
    });
  } catch (error) {
    console.error("[CONTROLLER REFRESH ERROR]", error.message);
    res.status(error.code || 500).json({
      success: false,
      message: error.message || "토큰 갱신 실패",
    });
  }
};
