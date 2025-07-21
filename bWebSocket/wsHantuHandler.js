const WebSocket = require("ws");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// 해외주식(미국/AMS) 호가 데이터 파싱 및 출력
function printStockHokaOverseas(data) {
  const recvvalue = data.split("^");
  console.log(
    "실시간종목코드 [" +
      recvvalue[0] +
      "]" +
      ", 종목코드 [" +
      recvvalue[1] +
      "]"
  );
  console.log("소숫점자리수 [" + recvvalue[2] + "]");
  console.log(
    "현지일자 [" + recvvalue[3] + "]" + ", 현지시간 [" + recvvalue[4] + "]"
  );
  console.log(
    "한국일자 [" + recvvalue[5] + "]" + ", 한국시간 [" + recvvalue[6] + "]"
  );
  console.log("======================================");
  console.log("매수총 잔량        [%s]", recvvalue[7]);
  console.log("매수총잔량대비      [%s]", recvvalue[9]);
  console.log("매도총 잔량        [%s]", recvvalue[8]);
  console.log("매도총잔략대비      [%s]", recvvalue[10]);
  console.log("매수호가           [%s]", recvvalue[11]);
  console.log("매도호가           [%s]", recvvalue[12]);
  console.log("매수잔량           [%s]", recvvalue[13]);
  console.log("매도잔량           [%s]", recvvalue[14]);
  console.log("매수잔량대비        [%s]", recvvalue[15]);
  console.log("매도잔량대비        [%s]", recvvalue[16]);
}

// 해외주식(미국/AMS) 체결 데이터 파싱 및 출력
function printStockPurchaseOverseas(data) {
  const menulist =
    "실시간종목코드|종목코드|수수점자리수|현지영업일자|현지일자|현지시간|한국일자|한국시간|시가|고가|저가|현재가|대비구분|전일대비|등락율|매수호가|매도호가|매수잔량|매도잔량|체결량|거래량|거래대금|매도체결량|매수체결량|체결강도|시장구분";
  const menustr = menulist.split("|");
  const pValue = data.split("^");
  for (let i = 0; i < menustr.length && i < pValue.length; i++) {
    console.log(`${menustr[i]} [${pValue[i]}]`);
  }
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

// 미리 구독할 S&P500 주요 종목 11개
const PRE_SUBSCRIBE_LIST = [
  { tr_id: "HDFSASP0", tr_key: "DAMSNVDA" }, // NVDA 엔비디아
  { tr_id: "HDFSASP0", tr_key: "DNASMSFT" }, // MSFT 마이크로소프트
  { tr_id: "HDFSASP0", tr_key: "DNASAAPL" }, // AAPL 애플
  { tr_id: "HDFSASP0", tr_key: "DNASAMZN" }, // AMZN 아마존닷컴
  { tr_id: "HDFSASP0", tr_key: "DNASMETA" }, // META 메타(페이스북)
  { tr_id: "HDFSASP0", tr_key: "DNASAVGO" }, // AVGO 브로드컴
  { tr_id: "HDFSASP0", tr_key: "DNASGOOGL" }, // ALPHA 구글(알파벳 A주)
  { tr_id: "HDFSASP0", tr_key: "DNASTSLA" }, // TSLA 테슬라
  { tr_id: "HDFSASP0", tr_key: "DNASNFLX" }, // NFLX 넷플릭스
  { tr_id: "HDFSASP0", tr_key: "DNASWMT" }, // WMT 월마트
  { tr_id: "HDFSASP0", tr_key: "DNASMETA" }, // META 메타(페이스북, 중복 확인)
];

// 해외주식 실시간 WebSocket 구독/파싱/출력 (SPY/AMS: DAMSSPY)
async function connectOverseasWS(appKey, appSecret, trKey = "DAMSSPY") {
  const approvalKey = await getApprovalKey(appKey, appSecret);
  const ws = new WebSocket("ws://ops.koreainvestment.com:21000");

  ws.on("open", () => {
    // 미리 구독할 종목들 모두 구독
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
      console.log("구독 메시지 전송:", msg);
    });
    // 기존 단일 trKey 구독도 유지(원하면 주석처리)
    // const subscribeList = [
    //   { tr_id: "HDFSASP0", tr_key: trKey },
    //   { tr_id: "HDFSCNT0", tr_key: trKey },
    // ];
    // subscribeList.forEach(({ tr_id, tr_key }) => {
    //   const msg = { ... };
    //   ws.send(JSON.stringify(msg));
    // });
  });

  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const tr_id = parsed?.header?.tr_id;
      const encrypt = parsed?.header?.encrypt;
      const output = parsed?.body?.output;

      if (tr_id === "PINGPONG") {
        ws.pong();
        return;
      }

      if (encrypt === "Y" && typeof output === "string") {
        // 복호화 필요 (실전에서는 복호화 키 관리 필요)
        // ... 복호화 로직 ...
      } else if (typeof output === "string") {
        // 실시간 데이터 파싱
        if (tr_id === "HDFSASP0") {
          console.log("#### 해외(미국)주식호가 ####");
          printStockHokaOverseas(output);
        } else if (tr_id === "HDFSCNT0") {
          console.log("#### 해외주식체결 ####");
          printStockPurchaseOverseas(output);
        } else {
          console.log("실시간 데이터:", output);
        }
      } else {
        console.log("실시간 데이터 수신:", parsed);
      }
    } catch (e) {
      console.error("JSON 파싱 실패:", e.message);
    }
  });

  ws.on("close", (code, reason) => {
    console.warn("WebSocket 연결 종료:", code, reason.toString());
  });

  ws.on("error", (err) => {
    console.error("WebSocket 에러:", err.message);
  });
}

// 실제 SPY(AMS) 실시간 구독 실행 (앱키/앱시크릿은 환경변수에서 읽음)
if (require.main === module) {
  const appKey = process.env.APP_KEY;
  const appSecret = process.env.APP_SECRET;
  if (!appKey || !appSecret) {
    console.error("APP_KEY, APP_SECRET 환경변수를 설정하세요.");
    process.exit(1);
  }
  connectOverseasWS(appKey, appSecret, "DAMSSPY");
}

module.exports = { connectOverseasWS };
