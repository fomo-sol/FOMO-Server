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
  const { AUTH = "", EXCD = "NAS", SYMB, GUBN = "0", BYMD, MODP } = req.query;
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
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjMwM2RhYThhLWNkMzctNDdmNy1hODk0LTU5Yzk1OWFkZDQwYyIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTc1MjUwMjY1MSwiaWF0IjoxNzUyNDE2MjUxLCJqdGkiOiJQU3dMVUxWSlRIWUZJdFB4YVdsUzJaZ3hXZ2NVcGJBS2Vta0MifQ.RgUIw9Xbc5w0LK5VlxzlZGAK1xBX2b2kyQ4tGK6DR97dKmFqSyrbd_tMW4QPTyuXW6Px2jFIxIQlccp3QAH09Q`, // Postman으로 토큰 받고 직접 넣어주세용
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

// 백엔드 /api/stocks?SYMB=MSFT&START=20250101&END=20250710
router.get("/", async (req, res) => {
  const { SYMB, START = "20250101", END = "20250710" } = req.query;

  const startDate = new Date(
      `${START.slice(0, 4)}-${START.slice(4, 6)}-${START.slice(6, 8)}`
  );
  const endDate = new Date(
      `${END.slice(0, 4)}-${END.slice(4, 6)}-${END.slice(6, 8)}`
  );

  let cursor = new Date(startDate);
  const allOutput2 = [];

  while (cursor <= endDate) {
    const BYMD = cursor.toISOString().split("T")[0].replace(/-/g, ""); // 20250701 형식
    const queryParams = new URLSearchParams({
      EXCD: "NAS",
      SYMB,
      GUBN: "0",
      BYMD,
    }).toString();

    const response = await fetch(`https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/dailyprice?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "content-type": "application/json",
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
        tr_id: "HHDFS76240000",
      },
    });

    const data = await response.json();
    if (data?.output2) {
      allOutput2.push(...data.output2);
    }

    cursor.setDate(cursor.getDate() + 1);
    await new Promise(resolve => setTimeout(resolve, 100)); // 속도 제한
  }

  res.status(200).json({ output2: allOutput2 });
});

module.exports = router;
