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
exports.getUserInfo = async () => {
    return await userRepository.getUserInfo();
};
