const repo = require("../repository/telegramRepository");

exports.saveTelegramSubscription = async (data) => {
    return await repo.insertSubscription(data);
};