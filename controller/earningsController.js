
const earningsService = require("../service/earningsService");
const earningsRepository = require("../repository/earningsRepository");
const {saveTokenToRedis, getTokenFromRedis} = require("../repository/redisRepository");

// ("/api/earnings/hantu/token")
exports.getHantuToken = async(req, res) => {
    try {
        const appKey = process.env.APP_KEY;
        const appSecret = process.env.APP_SECRET;
        const response = await fetch(
            "https://openapivts.koreainvestment.com:29443/oauth2/tokenP",
                {
                    method: "POST",
                    body: JSON.stringify({
                        grant_type: "client_credentials",
                        appkey: appKey,
                        appsecret: appSecret,
                    }),
                }
            );
        const token = await response.json();
        await saveTokenToRedis(token);

        res.status(200).json(token);

    } catch (err) {
        console.error("Error getHantuToken", err);
        res.status(500).json({ success: false, message: "Error getHantuToken 오류" });
    }
}

// ("/api/earnings/hantu")
exports.injectBarerToken = async(req, res) => {
    try {
        const appKey = process.env.APP_KEY;
        const appSecret = process.env.APP_SECRET;
        // 일단은 SYMB, BYMD 만 넣어주면 됨

        let { AUTH = "", SYMB, GUBN = "0", BYMD, MODP } = req.query;

        let EXCD;
        if (SYMB === "SPY") {
            EXCD = "NAS";
        } else {
            EXCD = await earningsRepository.getEarningsEXCD(SYMB);
        }

        if (SYMB === "BRK-B") {
            SYMB = "BRK/B";
        }  else if (SYMB === "BF-B") {
            SYMB = "BF/B";
        }

        const queryParams = new URLSearchParams({
            AUTH,
            EXCD,
            SYMB,
            GUBN,
            BYMD,
            MODP,
        }).toString();

        const myGetToken = await getTokenFromRedis();
        if (!myGetToken) {
            throw new Error("토큰이 없습니다.");
        }
        const getToken = myGetToken.access_token;

        const response = await fetch(
            `https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/dailyprice?${queryParams}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getToken}`,
                    "content-type": "application/json",
                    appKey: appKey,
                    appSecret: appSecret,
                    tr_id: "HHDFS76240000",
                },
            }
        );
        const data = await response.json();
        res.status(200).json(data);

    } catch (err) {
        console.error("Error in injectBarerToken", err);
        res.status(500).json({ success: false, message: "Error in injectBarerToken 오류" });
    }
};

// ("/api/earnings/ ? ")
exports.getEarningsList = async (req, res) => {
    try {
        const data = await earningsService.fetchEarningsList(req.query);
        res.json({ success: true, data });
    } catch (err) {
        console.error("Earnings list error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

// ("/api/earnings/ ? ")
exports.getEarningsById = async (req, res) => {
    try {
        const data = await earningsService.fetchEarningsById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: "존재하지 않는 ID입니다." });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error("Earnings detail error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

exports.getEarningsLangContent = async (req, res) => {
    try {
        const { id, lang } = req.params;
        const type = req.params.type || "earnings"; // 현재는 earnings 고정

        const content = await earningsService.fetchEarningsLangContent(id, lang);
        if (!content) {
            return res.status(404).json({ success: false, message: "콘텐츠를 찾을 수 없습니다." });
        }
        res.json({ success: true, content });
    } catch (err) {
        console.error("Earnings lang content error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};
//
// // 백엔드 /api/stocks?SYMB=MSFT&START=20250101&END=20250710
// router.get("/hantu/", async (req, res) => {
//     const { SYMB, START = "20250101", END = "20250710" } = req.query;
//
//     const startDate = new Date(
//         `${START.slice(0, 4)}-${START.slice(4, 6)}-${START.slice(6, 8)}`
//     );
//     const endDate = new Date(
//         `${END.slice(0, 4)}-${END.slice(4, 6)}-${END.slice(6, 8)}`
//     );
//
//     let cursor = new Date(startDate);
//     const allOutput2 = [];
//
//     while (cursor <= endDate) {
//         const BYMD = cursor.toISOString().split("T")[0].replace(/-/g, ""); // 20250701 형식
//         const queryParams = new URLSearchParams({
//             EXCD: "NAS",
//             SYMB,
//             GUBN: "0",
//             BYMD,
//         }).toString();
//
//         const response = await fetch(`https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/dailyprice?${queryParams}`, {
//             method: "GET",
//             headers: {
//                 Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
//                 "content-type": "application/json",
//                 appKey: process.env.APP_KEY,
//                 appSecret: process.env.APP_SECRET,
//                 tr_id: "HHDFS76240000",
//             },
//         });
//
//         const data = await response.json();
//         if (data?.output2) {
//             allOutput2.push(...data.output2);
//         }
//
//         cursor.setDate(cursor.getDate() + 1);
//         await new Promise(resolve => setTimeout(resolve, 100)); // 속도 제한
//     }
//
//     res.status(200).json({ output2: allOutput2 });
// });