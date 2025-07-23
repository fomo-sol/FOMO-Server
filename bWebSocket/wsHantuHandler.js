const WebSocket = require("ws");

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

// 해외주식(미국/AMS) 호가 데이터 파싱 및 출력 (정렬된 형태)
function printStockHokaOverseas(data) {
  const recv = data.split("^");
  const labels = [
    "실시간종목코드", "종목코드", "소숫점자리수", "현지일자", "현지시간",
    "한국일자", "한국시간", "매수총 잔량", "매도총 잔량", "매수총잔량대비",
    "매도총잔량대비", "매수호가", "매도호가", "매수잔량", "매도잔량",
    "매수잔량대비", "매도잔량대비"
  ];
  const values = [
    recv[0], recv[1], recv[2], recv[3], recv[4],
    recv[5], recv[6], recv[7], recv[8], recv[9],
    recv[10], recv[11], recv[12], recv[13], recv[14],
    recv[15], recv[16]
  ];
  console.log("\n📊 [해외주식 호가 데이터]");
  console.log("=".repeat(40));
  labels.forEach((label, idx) => {
    console.log(`${label.padEnd(16, " ")}: ${values[idx] ?? "-"}`);
  });
  console.log("=".repeat(40) + "\n");
}

// 해외주식(미국/AMS) 체결 데이터 파싱 및 출력 (정렬된 형태)
function printStockPurchaseOverseas(data) {
  const keys = "실시간종목코드|종목코드|수수점자리수|현지영업일자|현지일자|현지시간|한국일자|한국시간|시가|고가|저가|현재가|대비구분|전일대비|등락율|매수호가|매도호가|매수잔량|매도잔량|체결량|거래량|거래대금|매도체결량|매수체결량|체결강도|시장구분".split("|");
  const values = data.split("^");

  console.log("\n📈 [해외주식 체결 데이터]");
  console.log("=".repeat(40));
  for (let i = 0; i < keys.length && i < values.length; i++) {
    console.log(`${keys[i].padEnd(16, " ")}: ${values[i] ?? "-"}`);
  }
  console.log("=".repeat(40) + "\n");
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
async function connectOverseasWS(appKey, appSecret, trKey = "DAMSSPY") {
  const approvalKey = await getApprovalKey(appKey, appSecret);
  const ws = new WebSocket("ws://ops.koreainvestment.com:31000");

  ws.on("open", () => {
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
      console.log("📤 구독 메시지 전송:", msg.body.input.tr_key);
    });
  });

  ws.on("message", (data) => {
    try {
      const message = data.toString();

      // PING 메시지 응답
      if (message === "PINGPONG") {
        ws.pong();
        return;
      }

      // JSON이면 그대로 처리
      if (message.startsWith("{") || message.startsWith("[")) {
        const parsed = JSON.parse(message);
        const tr_id = parsed?.header?.tr_id;
        const encrypt = parsed?.header?.encrypt;
        const output = parsed?.body?.output;

        if (encrypt === "Y" && typeof output === "string") {
          console.warn("🔒 암호화된 데이터 수신:", output);
        } else if (typeof output === "string") {
          if (tr_id === "HDFSASP0") {
            printStockHokaOverseas(output);
          } else if (tr_id === "HDFSCNT0") {
            printStockPurchaseOverseas(output);
          } else {
            console.log("📡 기타 실시간 데이터:", output);
          }
        } else {
          console.log("📡 기타 데이터 수신:", parsed);
        }
      }

      // JSON이 아닐 경우: "|" 포함된 문자열이라면 수동 파싱
      else if (message.includes("|") && message.includes("^")) {
        const parts = message.split("|");
        const tr_id = parts[1];
        const rawData = parts[3];

        if (tr_id === "HDFSASP0") {
          printStockHokaOverseas(rawData);
        } else if (tr_id === "HDFSCNT0") {
          printStockPurchaseOverseas(rawData);
        } else {
          console.log(`📎 비JSON 데이터 수신 (TR: ${tr_id}):`, rawData);
        }
      }

      // 그 외 알 수 없는 형식
      else {
        console.warn("⚠️ 알 수 없는 메시지 형식:", message);
      }
    } catch (e) {
      console.error("❌ JSON 파싱 실패:", e.message);
      console.warn("수신한 원시 메시지:", data.toString());
    }
  });


  ws.on("close", (code, reason) => {
    console.warn("🔌 WebSocket 연결 종료:", code, reason.toString());
  });

  ws.on("error", (err) => {
    console.error("🚨 WebSocket 에러:", err.message);
  });
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
