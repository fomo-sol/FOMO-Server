const calendarService = require("../service/calendarService");

exports.getWeekCalendar = async (req, res) => {
    try {
        const { start, end } = req.query;

        const data = await calendarService.fetchWeekCalendar(start, end);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error("Calendar week error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch calendar data.",
        });
    }
};
