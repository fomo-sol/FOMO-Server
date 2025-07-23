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
  //   pingInterval: 30000,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Too many Redis reconnect attempts");
      return Math.min(retries * 100, 3000);
    },
  },

  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("reconnecting", () => console.log("🔁 Redis reconnecting..."));
redis.on("end", () => console.log("⛔️ Redis connection closed"));
redis.on("error", (err) => console.error("❌ Redis Client Error", err));

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("❌ Initial Redis connection failed:", err);
  }
})();

module.exports = redis;
