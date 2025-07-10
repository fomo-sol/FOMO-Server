const express = require("express");
const router = express.Router();

const appKey = process.env.APP_KEY;
const appSecret = process.env.APP_SECRET;

router.get("/token", async (req, res) => {
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
  res.status(200).json(token);
});

router.get("/", async (req, res) => {
  // 일단은 SYMB, BYMD 만 넣어주면 됨
  const { AUTH = "", EXCD = "NYS", SYMB, GUBN = "0", BYMD, MODP } = req.query;
  const queryParams = new URLSearchParams({
    AUTH,
    EXCD,
    SYMB,
    GUBN,
    BYMD,
    MODP,
  }).toString();
  const response = await fetch(
    `https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/dailyprice?${queryParams}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjE4NGU3ZGYwLTYwZWQtNGQwNS1hZGJiLWNjMmQ4OWE1NTU2MSIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc1MjIxNDc0NCwiaWF0IjoxNzUyMTI4MzQ0LCJqdGkiOiJQU3dMVUxWSlRIWUZJdFB4YVdsUzJaZ3hXZ2NVcGJBS2Vta0MifQ.gk9W5ZB4j4SYSOWCD3uFS_doAVXczkA2I7FP8f_NwW2UcAdCH9oxJNdFLyGWQFjs0483eTlsP6b6bqzRMoVmwg`, // Postman으로 토큰 받고 직접 넣어주세용
        "content-type": "application/json",
        appKey: appKey,
        appSecret: appSecret,
        tr_id: "HHDFS76240000",
      },
    }
  );
  const data = await response.json();
  res.status(200).json(data);
});

module.exports = router;
