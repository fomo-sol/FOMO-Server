const telegramRepository = require("../repository/telegramRepository");

exports.subscribeTelegram = async ({ userId, telegram_id }) => {
    if (!userId || !telegram_id) {
        const err = new Error("userId와 telegram_id는 필수입니다.");
        err.code = 400;
        throw err;
    }

    return await telegramRepository.updateTelegramId(userId, telegram_id);
};
