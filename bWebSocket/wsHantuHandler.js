const WebSocket = require("ws");
const { refreshRealtimeToken } = require("../service/Scheduler/tokenScheduler");
const { broadcastRealtime } = require("./wsClientHandler");
const { redis } = require("../config/redis");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Redis 오류 모니터링 및 WebSocket 재연결 관리
let currentWebSocket = null;
let redisErrorCount = 0;
const MAX_REDIS_ERRORS = 3; // Redis 오류 3회 발생 시 WebSocket 재연결

// Redis 오류 리스너 설정
redis.on("error", (err) => {
  console.error("❌ Redis 오류 발생:", err.message);
  redisErrorCount++;

  if (redisErrorCount >= MAX_REDIS_ERRORS) {
    console.warn(
      `⚠️ Redis 오류 ${MAX_REDIS_ERRORS}회 발생, WebSocket 재연결 시도`
    );
    redisErrorCount = 0; // 카운터 리셋

    if (currentWebSocket && currentWebSocket.readyState === WebSocket.OPEN) {
      console.log("🔄 Redis 오류로 인한 WebSocket 재연결 시작");
      currentWebSocket.close();
    }
  }
});

// Redis 연결 복구 시 카운터 리셋
redis.on("connect", () => {
  console.log("✅ Redis 연결 복구됨");
  redisErrorCount = 0;
});

// 해외주식(미국/AMS) 호가 데이터 파싱 및 출력 (정렬된 형태)
function printStockHokaOverseas(data) {
  const recv = data.split("^");

  // 실시간 데이터 브로드캐스트 (영어 필드명으로 변환)
  const symbol = recv[1]; // 종목코드
  const hokaData = {
    type: "hoka",
    symbol: symbol,
    realtimeCode: recv[0], // 실시간종목코드
    decimalPlaces: recv[2], // 소숫점자리수
    localDate: recv[3], // 현지일자
    localTime: recv[4], // 현지시간
    koreaDate: recv[5], // 한국일자
    koreaTime: recv[6], // 한국시간
    totalBidQty: recv[7], // 매수총 잔량
    totalAskQty: recv[8], // 매도총 잔량
    totalBidRatio: recv[9], // 매수총잔량대비
    totalAskRatio: recv[10], // 매도총잔량대비
    bidPrice: recv[11], // 매수호가
    askPrice: recv[12], // 매도호가
    bidQty: recv[13], // 매수잔량
    askQty: recv[14], // 매도잔량
    bidRatio: recv[15], // 매수잔량대비
    askRatio: recv[16], // 매도잔량대비
    timestamp: new Date().toISOString(),
  };

  // 성능을 위해 콘솔 출력 최소화 (필요시 주석 해제)
  // console.log(`📡 호가: ${symbol} - ${hokaData.bidPrice}/${hokaData.askPrice}`);
  broadcastRealtime(symbol, hokaData);
}

// 해외주식(미국/AMS) 체결 데이터 파싱 및 출력 (정렬된 형태)
function printStockPurchaseOverseas(data) {
  const keys =
    "실시간종목코드|종목코드|수수점자리수|현지영업일자|현지일자|현지시간|한국일자|한국시간|시가|고가|저가|현재가|대비구분|전일대비|등락율|매수호가|매도호가|매수잔량|매도잔량|체결량|거래량|거래대금|매도체결량|매수체결량|체결강도|시장구분".split(
      "|"
    );
  const values = data.split("^");

  // 실시간 데이터 브로드캐스트 (영어 필드명으로 변환)
  const symbol = values[1]; // 종목코드
  const purchaseData = {
    type: "purchase",
    symbol: symbol,
    realtimeCode: values[0], // 실시간종목코드
    decimalPlaces: values[2], // 소숫점자리수
    localBusinessDate: values[3], // 현지영업일자
    localDate: values[4], // 현지일자
    localTime: values[5], // 현지시간
    koreaDate: values[6], // 한국일자
    koreaTime: values[7], // 한국시간
    openPrice: values[8], // 시가
    highPrice: values[9], // 고가
    lowPrice: values[10], // 저가
    currentPrice: values[11], // 현재가
    changeType: values[12], // 대비구분
    changeAmount: values[13], // 전일대비
    changeRate: values[14], // 등락율
    bidPrice: values[15], // 매수호가
    askPrice: values[16], // 매도호가
    bidQty: values[17], // 매수잔량
    askQty: values[18], // 매도잔량
    tradeQty: values[19], // 체결량
    volume: values[20], // 거래량
    tradeAmount: values[21], // 거래대금
    askTradeQty: values[22], // 매도체결량
    bidTradeQty: values[23], // 매수체결량
    tradeStrength: values[24], // 체결강도
    marketType: values[25], // 시장구분
    timestamp: new Date().toISOString(),
  };

  // 성능을 위해 콘솔 출력 최소화 (필요시 주석 해제)
  // console.log(`📈 체결: ${symbol} - ${purchaseData.currentPrice} (${purchaseData.changeRate}%)`);
  broadcastRealtime(symbol, purchaseData);
}

// approval_key 발급 함수
async function getApprovalKey(appKey, appSecret) {
  const url = "https://openapi.koreainvestment.com:9443/oauth2/Approval";
  const body = {
    grant_type: "client_credentials",
    appkey: appKey,
    secretkey: appSecret,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.approval_key;
}

// 미리 구독할 S&P500 주요 종목 10개
const PRE_SUBSCRIBE_LIST = [
  { tr_id: "HDFSASP0", tr_key: "DAMSSPY" }, // SPY (AMS)
  { tr_id: "HDFSASP0", tr_key: "DAMSNVDA" },
  { tr_id: "HDFSASP0", tr_key: "DNASMSFT" },
  { tr_id: "HDFSASP0", tr_key: "DNASAAPL" },
  { tr_id: "HDFSASP0", tr_key: "DNASAMZN" },
  { tr_id: "HDFSASP0", tr_key: "DNASMETA" },
  { tr_id: "HDFSASP0", tr_key: "DNASAVGO" },
  { tr_id: "HDFSASP0", tr_key: "DNASGOOGL" },
  { tr_id: "HDFSASP0", tr_key: "DNASTSLA" },
  { tr_id: "HDFSASP0", tr_key: "DNASNFLX" },
  { tr_id: "HDFSASP0", tr_key: "DNASWMT" },
];

// 실시간 WebSocket 연결 및 메시지 처리
async function connectOverseasWS(
  appKey,
  appSecret,
  trKey = "DAMSSPY",
  retryCount = 0
) {
  const MAX_RETRY_COUNT = 20; // 최대 재시도 횟수 증가
  const MAX_RECONNECT_DELAY = 60000; // 최대 재연결 지연 60초

  if (retryCount >= MAX_RETRY_COUNT) {
    console.error(`❌ 최대 재시도 횟수(${MAX_RETRY_COUNT}) 초과. 재연결 중단.`);
    return;
  }

  console.log(`🔄 WebSocket 연결 시도 ${retryCount + 1}/${MAX_RETRY_COUNT}`);

  try {
    const approvalKey = await getApprovalKey(appKey, appSecret);
    const ws = new WebSocket("ws://ops.koreainvestment.com:31000");

    // 전역 WebSocket 인스턴스 저장 (Redis 오류 시 재연결용)
    currentWebSocket = ws;

    // 연결 타임아웃 설정
    const connectionTimeout = setTimeout(() => {
      console.error("⏰ WebSocket 연결 타임아웃");
      ws.close();
    }, 15000); // 15초 타임아웃 증가

    // 연결 상태 모니터링
    let isConnected = false;
    let lastPingTime = Date.now();
    const PING_INTERVAL = 30000; // 30초마다 ping 체크

    const pingInterval = setInterval(() => {
      if (isConnected && Date.now() - lastPingTime > PING_INTERVAL * 2) {
        console.warn("⚠️ WebSocket ping timeout, 재연결 시도");
        ws.close();
      }
    }, PING_INTERVAL);

    // Redis 상태 체크 (30초마다)
    const redisHealthCheck = setInterval(async () => {
      try {
        if (isConnected) {
          await redis.ping();
          redisErrorCount = 0; // 성공 시 오류 카운터 리셋
        }
      } catch (err) {
        console.warn("⚠️ Redis ping 실패:", err.message);
        redisErrorCount++;

        if (redisErrorCount >= MAX_REDIS_ERRORS) {
          console.warn("⚠️ Redis 상태 불량, WebSocket 재연결 시도");
          ws.close();
        }
      }
    }, 30000);

    ws.on("error", (err) => {
      console.error("🚨 WebSocket 에러:", err.message);
    });

    ws.on("open", () => {
      clearTimeout(connectionTimeout);
      isConnected = true;
      console.log("✅ WebSocket 연결됨");
      retryCount = 0; // 연결 성공 시 재시도 횟수 초기화

      // 구독 메시지 전송
      PRE_SUBSCRIBE_LIST.forEach(({ tr_id, tr_key }) => {
        const msg = {
          header: {
            approval_key: approvalKey,
            custtype: "P",
            tr_type: "1",
            "content-type": "utf-8",
          },
          body: {
            input: { tr_id, tr_key },
          },
        };
        ws.send(JSON.stringify(msg));
        // console.log("📤 구독 메시지 전송:", msg.body.input.tr_key);
      });
    });

    ws.on("message", (data) => {
      try {
        lastPingTime = Date.now(); // 메시지 수신 시 ping 시간 갱신

        const message = data.toString();
        if (message === "PINGPONG") {
          ws.pong();
          return;
        }

        if (message.startsWith("{") || message.startsWith("[")) {
          const parsed = JSON.parse(message);
          const tr_id = parsed?.header?.tr_id;
          const encrypt = parsed?.header?.encrypt;
          const output = parsed?.body?.output;

          if (encrypt === "Y" && typeof output === "string") {
            console.warn("🔒 암호화된 데이터 수신");
          } else if (typeof output === "string") {
            if (tr_id === "HDFSASP0") {
              printStockHokaOverseas(output);
            } else if (tr_id === "HDFSCNT0") {
              printStockPurchaseOverseas(output);
            }
            // 기타 데이터는 로그 제거로 성능 향상
          }
        } else if (message.includes("|") && message.includes("^")) {
          const parts = message.split("|");
          const tr_id = parts[1];
          const rawData = parts[3];

          if (tr_id === "HDFSASP0") {
            printStockHokaOverseas(rawData);
          } else if (tr_id === "HDFSCNT0") {
            printStockPurchaseOverseas(rawData);
          }
          // 기타 데이터는 로그 제거
        }
      } catch (e) {
        console.error("❌ JSON 파싱 실패:", e.message);
      }
    });

    ws.on("close", (code, reason) => {
      clearTimeout(connectionTimeout);
      clearInterval(pingInterval);
      clearInterval(redisHealthCheck);
      isConnected = false;
      currentWebSocket = null; // 전역 인스턴스 정리

      console.warn(
        `🔌 WebSocket 연결 종료: 코드=${code}, 이유=${reason.toString()}`
      );

      if (code === 1000) {
        console.log("✅ 정상 종료");
        return;
      }

      // 지수 백오프로 재연결 지연 계산
      const delay = Math.min(
        2000 * Math.pow(2, retryCount),
        MAX_RECONNECT_DELAY
      );
      console.log(
        `⏳ ${delay / 1000}초 후 재연결 시도... (${
          retryCount + 1
        }/${MAX_RETRY_COUNT})`
      );

      setTimeout(() => {
        connectOverseasWS(appKey, appSecret, trKey, retryCount + 1);
      }, delay);
    });

    ws.on("error", (err) => {
      clearTimeout(connectionTimeout);
      clearInterval(pingInterval);
      clearInterval(redisHealthCheck);
      isConnected = false;
      currentWebSocket = null;
      console.error("🚨 WebSocket 에러:", err.message);
      ws.close();
    });
  } catch (error) {
    console.error("❌ WebSocket 연결 중 에러:", error.message);
    const delay = Math.min(2000 * Math.pow(2, retryCount), MAX_RECONNECT_DELAY);
    console.log(
      `⏳ ${delay / 1000}초 후 재연결 시도... (${
        retryCount + 1
      }/${MAX_RETRY_COUNT})`
    );

    setTimeout(() => {
      connectOverseasWS(appKey, appSecret, trKey, retryCount + 1);
    }, delay);
  }
}

// 실행부 (환경변수 기반)
if (require.main === module) {
  const appKey = process.env.APP_KEY;
  const appSecret = process.env.APP_SECRET;
  if (!appKey || !appSecret) {
    console.error("❗ APP_KEY, APP_SECRET 환경변수를 설정하세요.");
    process.exit(1);
  }
  connectOverseasWS(appKey, appSecret, "DAMSSPY");
}

module.exports = { connectOverseasWS };
