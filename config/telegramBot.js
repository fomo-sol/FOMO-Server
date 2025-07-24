// config/telegramBot.js
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
    console.log("[BOT] 메시지 수신:", msg);

    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith("/start ")) {
        const userId = text.split(" ")[1];
        console.log(`[BOT] userId: ${userId}, chatId: ${chatId}`);

        axios.post("http://15.165.199.80:4000/api/telegram/subscribe", {
            userId,
            telegram_id: String(chatId),
        })
            .then(() => {
                bot.sendMessage(chatId, "📬 알림 구독이 완료되었습니다.");
            })
            .catch((err) => {
                console.error("[BOT ERROR] 구독 실패:", err.message);
                bot.sendMessage(chatId, "❌ 구독 실패! 관리자에게 문의하세요.");
            });
    }
});

module.exports = bot;
