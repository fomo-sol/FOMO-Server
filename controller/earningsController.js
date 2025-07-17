
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
        if (SYMB === "QQQ") {
            EXCD = "NAS";
        } else if (SYMB === "SPY") {
            EXCD = "AMS"
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

// ("/api/earnings/")
exports.getEarningsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const rawData = await earningsService.fetchEarningsList({ page, limit });

        // BigInt → string 변환 함수
        const normalizeBigInt = (obj) => {
            return JSON.parse(
                JSON.stringify(obj, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            );
        };

        res.json({
            success: true,
            data: normalizeBigInt(rawData)
        });
    } catch (err) {
        console.error("Earnings list error:", err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
};

// ("/api/earnings/:id ? ") // fomc 상세 페이지 실적 모음 stockID
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
