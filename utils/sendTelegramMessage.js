const axios = require("axios");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId, message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
        });
        return res.data;
    } catch (err) {
        console.error("[UTIL ERROR] 텔레그램 전송 실패:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = sendTelegramMessage;
