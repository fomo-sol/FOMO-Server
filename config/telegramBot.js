const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// 로컬에서는 bot을 null로 설정
let bot = null;

if (process.env.NODE_ENV === "production") {
  bot = new TelegramBot(token, { polling: true });
  console.log("✅ Telegram bot polling started (production)");

  bot.on("message", async (msg) => {
    console.log("[BOT] 메시지 수신:", msg);

    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith("/start ")) {
      const userId = text.split(" ")[1];
      console.log(`[BOT] userId: ${userId}, chatId: ${chatId}`);

      try {
        // API 호출
        const response = await axios.post("http://15.165.199.80:4000/api/telegram/subscribe", {
          userId,
          telegram_id: String(chatId),
        });
        
        console.log("[BOT] API 호출 성공:", response.status);
        
        // 성공 메시지 전송
        await bot.sendMessage(chatId, `📬 알림 구독이 완료되었습니다!

안녕하세요, FOMO입니다.  
앞으로 미국 경제 이벤트와 실적 발표 소식을  
📌 실시간 요약 + 알림으로 전해드릴게요.

⏰ 오늘의 미국장 시간 (한국 시간 기준)  
- 개장: 오후 10시 30분  
- 마감: 오전 5시  

👉 관심 종목 발표가 있을 경우, 브라우저와 텔레그램으로 바로 알려드려요!`);
        console.log("[BOT] 성공 메시지 전송 완료");
        
      } catch (err) {
        console.error("[BOT ERROR] 구독 실패:", err.message);
        
        // 실패 메시지 전송
        try {
          await bot.sendMessage(chatId, "❌ 구독 실패! 관리자에게 문의하세요.");
          console.log("[BOT] 실패 메시지 전송 완료");
        } catch (sendErr) {
          console.error("[BOT ERROR] 실패 메시지 전송 실패:", sendErr.message);
        }
      }
    }
  });
} else {
  console.log("⛔ Telegram bot not started (not in production)");
}

module.exports = bot;
