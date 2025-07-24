const { redis, ensureConnection } = require("../config/redis");

// 두 개 키 선언
const REALTIME_TOKEN_KEY = "hantu_realtime_token";
const PERIOD_TOKEN_KEY = "hantu_period_token";

async function saveRealTimeToken(token) {
  try {
    await ensureConnection();
    const tokenStr = typeof token === "string" ? token : JSON.stringify(token);
    await redis.set(REALTIME_TOKEN_KEY, tokenStr, "EX", 172800);
    console.log("RealTime Token saved to Redis");
  } catch (error) {
    console.error("Error saving RealTime token to Redis:", error);
    throw error;
  }
}

async function getRealTimeToken() {
  try {
    await ensureConnection();
    const tokenStr = await redis.get(REALTIME_TOKEN_KEY);
    if (!tokenStr) return null;
    try {
      return JSON.parse(tokenStr);
    } catch {
      return tokenStr;
    }
  } catch (error) {
    console.error("Error getting RealTime token from Redis:", error);
    return null;
  }
}

async function savePeriodToken(token) {
  try {
    await ensureConnection();
    const tokenStr = typeof token === "string" ? token : JSON.stringify(token);
    await redis.set(PERIOD_TOKEN_KEY, tokenStr, "EX", 172800);
    console.log("Period Token saved to Redis");
  } catch (error) {
    console.error("Error saving Period token to Redis:", error);
    throw error;
  }
}

async function getPeriodToken() {
  try {
    await ensureConnection();
    const tokenStr = await redis.get(PERIOD_TOKEN_KEY);
    if (!tokenStr) return null;
    try {
      return JSON.parse(tokenStr);
    } catch {
      return tokenStr;
    }
  } catch (error) {
    console.error("Error getting Period token from Redis:", error);
    return null;
  }
}

module.exports = {
  saveRealTimeToken,
  getRealTimeToken,
  savePeriodToken,
  getPeriodToken,
};
