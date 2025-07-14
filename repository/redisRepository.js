const redis = require("../config/redis");

const TOKEN_KEY = "hantu_access_token";

/**
 * 토큰 저장 (2일 = 172800초)
 */
async function saveTokenToRedis(token) {
    try {
        const tokenStr = typeof token === "string" ? token : JSON.stringify(token);
        await redis.set(TOKEN_KEY, tokenStr, "EX", 172800);
        console.log("Token saved to Redis");
    } catch (error) {
        console.error("Error saving token to Redis:", error);
    }
}

/**
 * 토큰 조회
 */
async function getTokenFromRedis() {
    try {
        const tokenStr = await redis.get(TOKEN_KEY);
        if (!tokenStr) return null;
        try {
            return JSON.parse(tokenStr);
        } catch {
            return tokenStr; // 문자열 그대로 반환
        }
    } catch (error) {
        console.error("Error getting token from Redis:", error);
        return null;
    }
}

module.exports = {
    saveTokenToRedis,
    getTokenFromRedis,
};
