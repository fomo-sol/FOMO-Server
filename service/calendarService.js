const calendarRepo = require("../repository/calendarRepository");

exports.fetchWeekCalendar = async (startDate, endDate) => {
    const fomcData = await calendarRepo.getFOMCInRange(startDate, endDate);

    return {
        fomc: fomcData,
        earnings: {}, // 일단 비워둠
    };
};