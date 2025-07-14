exports.registerUser = async (userData) => {
    // 실제 DB 저장은 생략
    return {
        id: "dummy-user-1",
        username: userData.username,
        message: "회원가입 성공",
    };
};

exports.loginUser = async (credentials) => {
    if (credentials.username === "test" && credentials.password === "1234") {
        return {
            token: "dummy-jwt-token",
            username: "test",
        };
    }
    return { error: "로그인 실패" };
};

exports.logoutUser = async () => {
    return "로그아웃 되었습니다.";
};

exports.getUserInfo = async () => {
    return {
        id: "dummy-user-1",
        username: "test",
        telegram_id: "12345678",
    };
};
