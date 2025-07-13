const calendarService = require("../service/calendarService");

exports.getCalendarByDate = async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: "date 파라미터가 필요합니다. 예: ?date=20250711",
        });
    }

    try {
        const data = await calendarService.fetchCalendarByDate(date);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: `${date}에 해당하는 일정이 없습니다.`,
            });
        }

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Calendar error:", error);
        return res.status(500).json({
            success: false,
            message: "서버 오류로 캘린더 정보를 불러올 수 없습니다.",
        });
    }
};