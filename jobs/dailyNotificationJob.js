// jobs/dailyNotificationJob.js

/*

const cron = require("node-cron");
const userRepository = require("../repository/userRepository");
const fcmService = require("../service/fcmService");

// 매일 3시 (03:00:00)에 실행
cron.schedule("0 3 * * *", async () => {
    console.log("🕒 [CRON] 매일 3시 요약 알림 작업 실행");

    try {
        // FCM 토큰이 등록된 유저만 조회
        const users = await userRepository.findAllWithFcmToken();

        for (const user of users) {
            const { fcm_token } = user;

            await fcmService.sendNotificationToToken(
                fcm_token,
                "📘 오늘의 요약",
                "오늘의 FOMC/실적 발표 요약이 도착했습니다!"
            );
        }

        console.log(`✅ 총 ${users.length}명에게 알림 발송 완료`);
    } catch (err) {
        console.error("❌ [CRON] 알림 발송 중 오류 발생:", err);
    }
});

// 🔁 매 1분마다 실행 (테스트용)
cron.schedule("* * * * *", async () => {
    console.log("🧪 [CRON TEST] 1분마다 알림 테스트 시작");

    try {
        const users = await userRepository.findAllWithFcmToken();

        for (const user of users) {
            const { fcm_token } = user;

            await fcmService.sendNotificationToToken(
                fcm_token,
                "📢 테스트 알림",
                "1분마다 발송되는 테스트 알림입니다"
            );
        }

        console.log(`✅ ${users.length}명에게 테스트 알림 전송 완료`);
    } catch (err) {
        console.error("❌ [CRON TEST] 오류 발생:", err);
    }
});

 */