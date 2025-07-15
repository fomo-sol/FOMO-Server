const { createClient } = require("redis");
require("dotenv").config();

const requiredEnv = ["REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD"];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`❌ Missing required Redis env: ${key}`);
        process.exit(1); // ⛔️ 환경변수 누락 시 종료
    }
}

const redis = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    username: process.env.REDIS_USERNAME, // 필요 없으면 제거 가능
    password: process.env.REDIS_PASSWORD,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

redis.connect();

module.exports = redis;
