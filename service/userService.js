const jwt = require("jsonwebtoken");
const userRepository = require("../repository/userRepository");
const bcrypt = require("bcrypt");

exports.register = async (userData) => {
  console.log("[SERVICE] register 호출");
  return await userRepository.createUser(userData);
};

exports.loginUser = async ({ email, passwd }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error("존재하지 않는 사용자입니다.");
    err.code = 401;
    throw err;
  }

  console.log("[DEBUG] 입력된 비밀번호:", passwd);
  console.log("[DEBUG] DB 저장된 해시:", user.passwd);

  const bcrypt = require("bcrypt");
  const isMatch = await bcrypt.compare(passwd, user.passwd);
  console.log("[DEBUG] 비교 결과:", isMatch);

  if (!isMatch) {
    const err = new Error("비밀번호가 일치하지 않습니다.");
    err.code = 401;
    throw err;
  }

  delete user.passwd;

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return { user, token };
};

exports.logoutUser = async () => {
  // 나중에 세션 파기나 토큰 블랙리스트 등을 구현 가능
  return "로그아웃 되었습니다.";
};

exports.getUserInfo = async (userId) => {
  return await userRepository.findById(userId);
};

exports.saveFcmToken = async (userId, fcm_token) => {
  try {
    // 토큰 중복 여부 확인
    const existing = await userRepository.findByFcmToken(fcm_token);

    // 다른 유저가 이미 사용 중이라면 해당 유저 토큰 제거
    if (existing && existing.id !== userId) {
      console.warn("⚠️ 다른 유저가 이미 같은 FCM 토큰을 사용 중:", existing.id);
      await userRepository.removeFcmToken(existing.id);
    }

    // 현재 유저에게 토큰 저장
    await userRepository.saveFcmToken(userId, fcm_token);
    console.log("✅ FCM 토큰 저장 완료:", fcm_token);
  } catch (err) {
    console.error("[SERVICE ERROR] saveFcmToken 실패:", err.stack || err);
    throw err;
  }
};

exports.findUserByFcmToken = async (fcm_token) => {
  return await userRepository.findByFcmToken(fcm_token);
};

exports.removeFcmToken = async (userId) => {
  return await userRepository.removeFcmToken(userId);
};

exports.refreshToken = async (token) => {
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 정보 조회
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      const err = new Error("존재하지 않는 사용자입니다.");
      err.code = 401;
      throw err;
    }

    // 새 토큰 생성
    const newToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    delete user.passwd;
    return { user, token: newToken };
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      const err = new Error("유효하지 않은 토큰입니다.");
      err.code = 401;
      throw err;
    }
    throw error;
  }
};
