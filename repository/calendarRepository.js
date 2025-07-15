const pool = require("../config/db");

// 📌 FOMC 일정 범위 조회
exports.getFOMCInRange = async (startDate, endDate) => {
    const [rateResult] = await pool.execute(
        `SELECT fed_release_date AS datetime, fed_start_time
         FROM fomc_rate_decisions
         WHERE DATE(fed_release_date) BETWEEN ? AND ?`,
        [startDate, endDate]
    );

    const [minutesResult] = await pool.execute(
        `SELECT fomc_release_date AS datetime, fomc_start_time
         FROM fomc_minutes
         WHERE DATE(fomc_release_date) BETWEEN ? AND ?`,
        [startDate, endDate]
    );

    const rateRows = Array.isArray(rateResult) ? rateResult : [rateResult];
    const minutesRows = Array.isArray(minutesResult) ? minutesResult : [minutesResult];

    console.log("✅ rateRows:", rateRows);
    console.log("✅ minutesRows:", minutesRows);

    const result = {};

    rateRows.forEach((row) => {
        if (!row || !row.datetime) return;

        const dateKey = new Date(row.datetime).toISOString().split("T")[0].replace(/-/g, "");
        result[dateKey] = {
            event: "FOMC 금리 발표",
            time: new Date(row.fed_start_time).toTimeString().slice(0, 5),
        };
    });

    minutesRows.forEach((row) => {
        if (!row || !row.datetime) return;

        const dateKey = new Date(row.datetime).toISOString().split("T")[0].replace(/-/g, "");
        if (!result[dateKey]) {
            result[dateKey] = {
                event: "FOMC 의사록 공개",
                time: new Date(row.fomc_start_time).toTimeString().slice(0, 5),
            };
        }
    });

    return result;
};
