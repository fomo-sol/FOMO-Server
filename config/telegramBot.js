// config/telegramBot.js
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot;


if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing! 봇을 실행할 수 없습니다.");
  process.exit(1);
}


async function initBot() {
  bot = new TelegramBot(token, { polling: false });

  // webhook 제거 후 polling 시작
  await bot.deleteWebhook();
  await bot.startPolling();

  console.log("[BOT] Telegram polling 시작됨");

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith("/start ")) {
      const userId = text.split(" ")[1];

      try {
        await axios.post("http://localhost:4000/api/telegram/subscribe", {
          userId,
          telegram_id: String(chatId),
        });
        bot.sendMessage(chatId, "📬 알림 구독이 완료되었습니다.");
      } catch (err) {
        console.error("[BOT ERROR] 구독 실패:", err.message);
        bot.sendMessage(chatId, "❌ 구독 실패! 관리자에게 문의하세요.");
      }
    }
  });
}

module.exports = { initBot };
