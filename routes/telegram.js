const express = require("express");
const router = express.Router();
const telegramController = require("../controller/telegramController");

router.post("/subscribe", telegramController.subscribeTelegram);

router.get('/url', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    console.log(`[WARN] 텔레그램 URL 요청 시 userId 누락`);
    return res.status(400).json({ error: "userId가 필요합니다." });
  }

  const url = `https://t.me/FomoSol_Bot?start=${userId}`;
  console.log(`[INFO] 텔레그램 URL 생성: userId=${userId}`);
  res.json({ url });
});

module.exports = router;