const { createClient } = require("redis");
require("dotenv").config();

const requiredEnv = ["REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing required Redis env: ${key}`);
    process.exit(1);
  }
}

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    connectTimeout: 10000, // 10초 연결 타임아웃
    commandTimeout: 5000, // 5초 명령 타임아웃
    keepAlive: 30000, // 30초 keep-alive
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        console.error("❌ Redis 재연결 시도 횟수 초과");
        return new Error("Too many Redis reconnect attempts");
      }
      const delay = Math.min(retries * 1000, 10000); // 최대 10초
      console.log(`🔁 Redis 재연결 시도 ${retries}/20 (${delay}ms 후)`);
      return delay;
    },
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("reconnecting", () => console.log("🔁 Redis reconnecting..."));
redis.on("end", () => console.log("⛔️ Redis connection closed"));
redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
  // ETIMEDOUT 에러는 재연결 시도 중이므로 로그 레벨 낮춤
  if (err.code !== "ETIMEDOUT") {
    console.error("❌ Redis Error Details:", err);
  }
});

// 연결 관리
let isConnecting = false;
let connectionPromise = null;

async function ensureConnection() {
  if (redis.isReady) {
    return redis;
  }

  if (isConnecting) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = redis
    .connect()
    .catch((err) => {
      console.error("❌ Redis 연결 실패:", err.message);
      isConnecting = false;
      throw err;
    })
    .then(() => {
      isConnecting = false;
      return redis;
    });

  return connectionPromise;
}

// 초기 연결
(async () => {
  try {
    await ensureConnection();
  } catch (err) {
    console.error("❌ Initial Redis connection failed:", err.message);
  }
})();

module.exports = { redis, ensureConnection };
