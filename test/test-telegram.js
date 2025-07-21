require("dotenv").config();
const telegramService = require("../service/telegramService");

(async () => {
    try {
        const userId = "11ef52ab-6051-11f0-b538-02edf43f4249";
        await telegramService.sendTelegramAlert(userId, "✅ 개별 유저 알림 테스트!");
        await telegramService.broadcastTelegramAlert("📢 전체 유저에게 보내는 메시지!");
        console.log("✅ 테스트 완료");
    } catch (err) {
        console.error("❌ 테스트 중 오류:", err.message);
    }
})();