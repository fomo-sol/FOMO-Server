const clientSubscriptions = new Map(); // { ws: Set<symbol> }
const symbolDataMap = new Map(); // { symbol: latestData }
const serverSubscriptions = new Set(); // 서버에서 구독 중인 종목들

// 한투 WebSocket 핸들러에서 가져올 함수들
let subscribeToSymbol = null;
let unsubscribeFromSymbol = null;

// 한투 WebSocket 핸들러에서 함수들을 설정
exports.setHantuHandlers = (subscribeFn, unsubscribeFn) => {
  subscribeToSymbol = subscribeFn;
  unsubscribeFromSymbol = unsubscribeFn;
};

exports.handleConnection = (ws) => {
  console.log("🔗 새로운 클라이언트 연결됨");
  clientSubscriptions.set(ws, new Set());

  ws.on("message", (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    // 구독 요청
    if (msg.type === "subscribe" && msg.symbol) {
      const symbol = msg.symbol.toUpperCase();
      clientSubscriptions.get(ws).add(symbol);
      console.log(`📋 클라이언트 구독: ${symbol}`);
      ws.send(JSON.stringify({ type: "subscribed", symbol: symbol }));

      // 서버에서 해당 종목을 구독하지 않았다면 구독 추가
      if (!serverSubscriptions.has(symbol)) {
        serverSubscriptions.add(symbol);
        console.log(`🔄 서버 구독 추가: ${symbol}`);
        // 한투 WebSocket에 구독 요청
        if (subscribeToSymbol) {
          subscribeToSymbol(symbol);
        }
      }

      // 최신 데이터 즉시 push
      const latest = symbolDataMap.get(symbol);
      if (latest) {
        console.log(`📤 최신 데이터 즉시 전송: ${symbol}`);
        ws.send(
          JSON.stringify({ type: "realtime", symbol: symbol, data: latest })
        );
      }
    }

    // 구독 해제 요청
    else if (msg.type === "unsubscribe" && msg.symbol) {
      const symbol = msg.symbol.toUpperCase();
      clientSubscriptions.get(ws).delete(symbol);
      console.log(`📋 클라이언트 구독 해제: ${symbol}`);
      ws.send(JSON.stringify({ type: "unsubscribed", symbol: symbol }));

      // 다른 클라이언트가 해당 종목을 구독하지 않는다면 서버 구독도 해제
      let hasOtherSubscribers = false;
      for (const [clientWs, symbols] of clientSubscriptions.entries()) {
        if (clientWs !== ws && symbols.has(symbol)) {
          hasOtherSubscribers = true;
          break;
        }
      }

      if (!hasOtherSubscribers) {
        serverSubscriptions.delete(symbol);
        console.log(`🔄 서버 구독 해제: ${symbol}`);
        // 한투 WebSocket에서 구독 해제 요청
        if (unsubscribeFromSymbol) {
          unsubscribeFromSymbol(symbol);
        }
      }
    }

    // 기존 호환성을 위한 구독 요청 (deprecated)
    else if (msg.type === "symbol" && msg.symbol) {
      const symbol = msg.symbol.toUpperCase();
      clientSubscriptions.get(ws).add(symbol);
      console.log(`📋 클라이언트 구독 (legacy): ${symbol}`);
      ws.send(JSON.stringify({ ok: true, symbol: symbol }));

      // 서버에서 해당 종목을 구독하지 않았다면 구독 추가
      if (!serverSubscriptions.has(symbol)) {
        serverSubscriptions.add(symbol);
        console.log(`🔄 서버 구독 추가: ${symbol}`);
      }

      // 최신 데이터 즉시 push
      const latest = symbolDataMap.get(symbol);
      if (latest) {
        console.log(`📤 최신 데이터 즉시 전송: ${symbol}`);
        ws.send(
          JSON.stringify({ type: "realtime", symbol: symbol, data: latest })
        );
      }
    }
  });

  ws.on("close", () => {
    console.log("🔌 클라이언트 연결 종료");

    // 연결 종료 시 해당 클라이언트가 구독하던 종목들 정리
    const clientSymbols = clientSubscriptions.get(ws);
    if (clientSymbols) {
      for (const symbol of clientSymbols) {
        // 다른 클라이언트가 해당 종목을 구독하지 않는다면 서버 구독도 해제
        let hasOtherSubscribers = false;
        for (const [clientWs, symbols] of clientSubscriptions.entries()) {
          if (clientWs !== ws && symbols.has(symbol)) {
            hasOtherSubscribers = true;
            break;
          }
        }

        if (!hasOtherSubscribers) {
          serverSubscriptions.delete(symbol);
          console.log(`🔄 서버 구독 해제 (연결 종료): ${symbol}`);
        }
      }
    }

    clientSubscriptions.delete(ws);
  });
};

// 한투 데이터 수신 시 호출
exports.broadcastRealtime = (symbol, data) => {
  symbolDataMap.set(symbol, data);
  let broadcastCount = 0;

  for (const [ws, symbols] of clientSubscriptions.entries()) {
    if (symbols.has(symbol) && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "realtime", symbol, data }));
      broadcastCount++;
    }
  }

  if (broadcastCount > 0) {
    console.log(
      `📡 실시간 데이터 브로드캐스트: ${symbol} -> ${broadcastCount}개 클라이언트`
    );
  }
};

// 현재 서버에서 구독 중인 종목들 반환
exports.getServerSubscriptions = () => {
  return Array.from(serverSubscriptions);
};
