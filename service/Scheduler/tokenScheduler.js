// scheduledTask.js
const cron = require("node-cron");
const HOST = process.env.NEXT_PUBLIC_API_HOST;

require("dotenv").config();

console.log("HOST ENV:", HOST);

async function refreshToken() {
  try {
    const response = await fetch(`${HOST}/api/earnings/hantu/token`, {
      method: "GET",
    });

    const data = await response.json();
    console.log(
      "✅ Hantu token refreshed at",
      new Date().toLocaleString(),
      data
    );
  } catch (err) {
    console.error("❌ Failed to refresh Hantu token:", err);
  }
}

// 하루에 2번 실행: 오전 8시, 오후 8시 (한국시간 기준)
cron.schedule("0 8,20 * * *", () => {
  console.log("🔄 Running Hantu token refresh...");
  refreshToken();
});
