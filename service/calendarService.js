const calendarRepo = require("../repository/calendarRepository");

exports.fetchWeekCalendar = async (startDate, endDate) => {
    const fomcData = await calendarRepo.getFOMCInRange(startDate, endDate);
    const earningsData = await calendarRepo.getEarningsInRange(startDate, endDate); // ✅ 이 줄 추가

    return {
        fomc: fomcData,
        earnings: earningsData
    };
};