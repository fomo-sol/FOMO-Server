const clientSubscriptions = new Map(); // { ws: Set<symbol> }
const symbolDataMap = new Map(); // { symbol: latestData }

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
    if (msg.type === "symbol" && msg.symbol) {
      clientSubscriptions.get(ws).add(msg.symbol);
      console.log(`📋 클라이언트 구독: ${msg.symbol}`);
      ws.send(JSON.stringify({ ok: true, symbol: msg.symbol }));
      // 최신 데이터 즉시 push (선택)
      const latest = symbolDataMap.get(msg.symbol);
      if (latest) {
        console.log(`📤 최신 데이터 즉시 전송: ${msg.symbol}`);
        ws.send(
          JSON.stringify({ type: "realtime", symbol: msg.symbol, data: latest })
        );
      }
    }
  });

  ws.on("close", () => {
    console.log("🔌 클라이언트 연결 종료");
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
