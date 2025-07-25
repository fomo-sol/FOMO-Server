const db = require("../config/db");

exports.fetchMainData = async () => {
    return {
        service_name: "FOMO",
        description: "발표가 끝나면 바로 도착하는 한글 요약",
        version: "1.0.0",
        links: {
        }
    };
};