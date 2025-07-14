const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 💡 이후 req.user로 접근 가능
        next();
    } catch (error) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
}

module.exports = authenticate;
