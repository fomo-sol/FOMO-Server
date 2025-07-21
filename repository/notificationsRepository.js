exports.getAllNotifications = async () => {
    return [
        {
            id: "1",
            type: "fomc",
            message: "7월 FOMC 의사록이 공개되었습니다.",
            created_at: "2025-07-10T12:00:00Z",
        },
        {
            id: "2",
            type: "earnings",
            message: "테슬라 실적 발표가 오늘 예정되어 있습니다.",
            created_at: "2025-07-11T08:00:00Z",
        },
    ];
};

exports.getCustomNotifications = async () => {
    return [
        {
            id: "99",
            type: "favorite",
            message: "관심 종목 '애플' 실적 발표가 곧 시작됩니다.",
            created_at: "2025-07-11T09:00:00Z",
        },
    ];
};