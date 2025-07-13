const calendarRepo = require("../repository/calendarRepository");

exports.fetchCalendarByDate = async (date) => {
    return await calendarRepo.getCalendarByDate(date);
};