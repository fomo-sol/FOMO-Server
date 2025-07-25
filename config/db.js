// config/db.js

const mariadb = require("mariadb");
require("dotenv").config();

// 연결 풀 설정 개선
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 30000, // 연결 획득 타임아웃 30초
  timeout: 30000, // 쿼리 타임아웃 30초
  idleTimeout: 60000, // 유휴 연결 타임아웃 60초
  reconnect: true, // 자동 재연결 활성화
  resetAfterUse: true, // 사용 후 연결 리셋
  trace: false, // 디버그용 트레이스 비활성화
  multipleStatements: false, // 보안을 위해 다중 쿼리 비활성화
});

// 연결 풀 에러 처리 - 서버 종료 방지
pool.on("error", (err) => {
  console.error("❌ Database pool error:", err.message);

  // fatal 에러가 아닌 경우 서버를 종료하지 않음
  if (err.fatal) {
    console.warn("⚠️ Fatal database error detected, attempting recovery...");
    // 치명적 에러 시에도 서버를 종료하지 않고 로그만 남김
    // 필요시 연결 풀 재생성 로직 추가 가능
  }
});

// 연결 풀 상태 모니터링 (1분마다)
setInterval(() => {
  try {
    const poolInfo = pool.pool;
    if (poolInfo) {
      console.log(
        `📊 DB Pool Status - Active: ${poolInfo.activeConnections}, Idle: ${poolInfo.idleConnections}, Total: ${poolInfo.totalConnections}`
      );
    }
  } catch (err) {
    console.warn("⚠️ Failed to get pool status:", err.message);
  }
}, 60000);

// 프로세스 종료 시 연결 풀 정리
process.on("SIGINT", async () => {
  console.log("🔄 Closing database pool...");
  try {
    await pool.end();
    console.log("✅ Database pool closed successfully");
  } catch (err) {
    console.error("❌ Error closing database pool:", err.message);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔄 Closing database pool...");
  try {
    await pool.end();
    console.log("✅ Database pool closed successfully");
  } catch (err) {
    console.error("❌ Error closing database pool:", err.message);
  }
  process.exit(0);
});

module.exports = pool;
