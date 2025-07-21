require("dotenv").config()

const axios = require("axios");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const telegramRepository = require("../repository/telegramRepository");

exports.subscribeTelegram = async ({ userId, telegram_id }) => {
    if (!userId || !telegram_id) {
        const err = new Error("userId와 telegram_id는 필수입니다.");
        err.code = 400;
        throw err;
    }

    return await telegramRepository.updateTelegramId(userId, telegram_id);
};

// 🔹 개별 전송
exports.sendTelegramAlert = async (userId, message) => {
    const chatId = await telegramRepository.getTelegramChatIdByUserId(userId);

    if (!chatId) {
        console.warn(`[WARN] userId ${userId}는 텔레그램 미연결`);
        return;
    }

    await sendTelegramMessage(chatId, message);
};

// 🔹 전체 전송
exports.broadcastTelegramAlert = async (message) => {
    const subscribers = await telegramRepository.getAllTelegramSubscribers();

    await Promise.all(
        subscribers.map(async (user) => {
            try {
                await sendTelegramMessage(user.telegram_id, message);
            } catch (err) {
                console.warn(`[WARN] ${user.userId} 전송 실패:`, err.message);
            }
        })
    );
};

// 🔹 전송 유틸 함수
async function sendTelegramMessage(chatId, message) {
    try {
        const res = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown",
            }
        );
        return res.data;
    } catch (err) {
        console.error("[UTIL ERROR] 텔레그램 전송 실패:", err.response?.data || err.message);
        throw err;
    }
}