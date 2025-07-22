
const earningsService = require("../service/earningsService");
const earningsRepository = require("../repository/earningsRepository");
const favoriteService = require("../service/favoritesService");

const {saveTokenToRedis, getTokenFromRedis, savePeriodToken, saveRealTimeToken, getPeriodToken} = require("../repository/redisRepository");

// ("/api/earnings/hantu/realTimeToken")
exports.getRealTimeToken = async (req, res) => {
    try {
        const appKey = process.env.APP_KEY;
        const appSecret = process.env.APP_SECRET;

        const response = await fetch(
            "https://openapivts.koreainvestment.com:29443/oauth2/Approval",
            {
                method: "POST",
                body: JSON.stringify({
                    grant_type: "client_credentials",
                    appkey: appKey,
                    secretkey: appSecret,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Approval API 요청 실패: ${response.status} ${errorBody}`);
        }

        const data = await response.json();

        const approvalKey = data.result || data.approval_key;

        if (!approvalKey) {
            throw new Error("approval_key를 응답에서 찾을 수 없습니다.");
        }

        // Redis에 저장 (예: saveTokenToRedis 함수가 approval_key도 저장하도록 수정 필요)
        await saveRealTimeToken({ approval_key: approvalKey, raw: data });

        res.status(200).json({ success: true, approval_key: approvalKey });
    } catch (err) {
        console.error("Error getRealTimeToken", err);
        res.status(500).json({ success: false, message: "Error getRealTimeToken 오류" });
    }
};

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
        await savePeriodToken(token);

        res.status(200).json(token);

    } catch (err) {
        console.error("Error getHantuToken", err);
        res.status(500).json({ success: false, message: "Error getHantuToken 오류" });
    }
}


// api/earings/hantu/minutesChart
exports.getMinutesChart = async (req, res) => {
    try {
        const appKey = process.env.APP_KEY;
        const appSecret = process.env.APP_SECRET;

        let {
            AUTH = "",         // 공백
            SYMB,              // 종목코드
            GUBN = "0",        // (필요 시 사용, 기본은 0)
            EXCD,              // 거래소 코드
            NMIN = "5",        // 분 단위 (1분봉)
            PINC = "1",        // 전일 포함 여부 (1: 전일 포함)
            NEXT = "",         // 처음 조회 시 공백
            NREC = "100",      // 요청할 레코드 수 (최대 120)
            FILL = "",         // 공백
            KEYB = "",         // KEYB 시간 포맷: YYYYMMDDHHMMSS (처음 조회 시 공백)
        } = req.query;

        // 거래소 자동 매핑
        if (!EXCD) {
            if (SYMB === "QQQ") {
                EXCD = "NAS";
            } else if (SYMB === "SPY") {
                EXCD = "AMS";
            } else {
                EXCD = await earningsRepository.getEarningsEXCD(SYMB);
            }
        }

        // 종목코드 예외 처리
        if (SYMB === "BRK-B") SYMB = "BRK/B";
        else if (SYMB === "BF-B") SYMB = "BF/B";

        const queryParams = new URLSearchParams({
            AUTH,
            EXCD,
            SYMB,
            NMIN,
            PINC,
            NEXT,
            NREC,
            FILL,
            KEYB,
        }).toString();

        // 토큰 가져오기
        const myGetToken = await getPeriodToken();
        if (!myGetToken) {
            throw new Error("토큰이 없습니다.");
        }
        const getToken = myGetToken.access_token;

        // 분봉 API 호출
        const response = await fetch(
            `https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice?${queryParams}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getToken}`,
                    "content-type": "application/json; charset=utf-8",
                    appKey: appKey,
                    appSecret: appSecret,
                    tr_id: "HHDFS76950200",
                    custtype: "P", // 개인 (B는 법인)
                },
            }
        );

        const data = await response.json();
        res.status(200).json(data);

    } catch (err) {
        console.error("Error in getMinutesChart", err);
        res.status(500).json({
            success: false,
            message: "1분봉 차트 조회 실패",
        });
    }
};



// ("/api/earnings/hantu")
exports.getDailyChart = async(req, res) => {
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

        const myGetToken = await getPeriodToken();
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
        console.error("Error in getDailyChart", err);
        res.status(500).json({ success: false, message: "Error in getDailyChart 오류" });
    }
};

exports.getMyFavoritesStocks = async (req, res) => {
    try {

    const { id } = req.params;
    const myFavoritesStocks = await favoriteService.fetchFavorites(id);
    const data = await earningsService.getMyFavoritesStockFinances(myFavoritesStocks);

        const normalizeBigInt = (obj) => {
            return JSON.parse(
                JSON.stringify(obj, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            );
        };

        res.json({
            success: true,
            data: normalizeBigInt(data)
        });
    } catch (err) {
        console.error("Error in getMyFavoritesStocks", err);
        res.status(500).json({ success: false, message: "Error in getMyFavoritesStocks" });
    }
}

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


// ("/api/earnings/:symbol ? ") // fomc 상세 페이지 실적 모음
exports.getEarningsBySymbol = async (req, res) => {
    try {

        const stockId = await earningsRepository.getStockIdBySymbol(req.params.symbol);
        console.log(stockId);

        const data = await earningsService.fetchEarningsById(stockId[0].id);
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
