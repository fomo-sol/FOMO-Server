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

async function refreshRealtimeToken() {
  try {
    const response = await fetch(`${HOST}/api/earnings/hantu/realtimeToken`, {
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

// 하루 2시간마다 실행 (한국시간 기준)
cron.schedule("0 */2 * * *", () => {
  console.log("🔄 Running Hantu token refresh...");
  refreshToken();
});

exports.refreshToken = refreshToken;
exports.refreshRealtimeToken = refreshRealtimeToken;