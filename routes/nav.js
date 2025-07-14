const express = require("express");
const router = express.Router();
const navController = require("../controller/navController");

// 상단 환율 및 주요 종목
router.get("/header", navController.getHeaderNav);

// 좌측 FOMC 네비게이션
router.get("/fomc", navController.getFomcNav);

// 좌측 실적발표 네비게이션
router.get("/earnings", navController.getEarningsNav);

module.exports = router;