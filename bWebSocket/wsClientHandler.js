exports.handleConnection = (ws) => {
  console.log("WebSocket 클라이언트 연결됨");

  // 1초마다 현재 날짜/시간을 전송
  const intervalId = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "time",
          time: new Date().toISOString(),
        })
      );
    }
  }, 1000);

  ws.on("message", (message) => {
    try {
      let msg;
      try {
        msg = JSON.parse(message);
      } catch {
        msg = message;
      }
      console.log("클라이언트로부터 메시지:", msg);
      // 심볼 요청 메시지 처리
      if (
        msg &&
        typeof msg === "object" &&
        msg.type === "symbol" &&
        msg.symbol
      ) {
        ws.send(
          JSON.stringify({
            ok: true,
            symbol: msg.symbol,
            time: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      console.error("메시지 처리 중 에러:", err);
      ws.send(
        JSON.stringify({
          error: true,
          message: "메시지 처리 중 에러",
          detail: err.message,
        })
      );
    }
  });
  ws.on("close", () => {
    clearInterval(intervalId);
    console.log("WebSocket 클라이언트 연결 종료");
  });
};
