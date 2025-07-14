const calendarDummy = {
    "20250711": {
        earnings: {
            pre_market: [
                { company: "NVIDIA", time: "08:00", symbol: "NVDA" },
                { company: "Apple", time: "08:30", symbol: "AAPL" },
            ],
            after_market: [
                { company: "Tesla", time: "17:00", symbol: "TSLA" },
            ],
        },
        fomc: {
            event: "FOMC 금리 발표",
            time: "15:00",
        },
    },
    "20250712": {
        earnings: {
            pre_market: [],
            after_market: [
                { company: "Amazon", time: "16:30", symbol: "AMZN" },
            ],
        },
        fomc: null,
    },
};

exports.getCalendarByDate = async (date) => {
    return calendarDummy[date] || null;
};