const mainRepo = require("../repository/mainRepository");

exports.getMainData = async () => {
    const data = await mainRepo.fetchMainData();
    return data;
};