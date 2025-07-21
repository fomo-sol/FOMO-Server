const express = require("express");
const router = express.Router();
const earningsController = require("../controller/earningsController");

//hantu
router.get("/hantu/", earningsController.getDailyChart);

router.get("/hantu/minutesChart", earningsController.getMinutesChart);

//hantu get token 한투 토큰 받기
router.get("/hantu/token", earningsController.getHantuToken);

//hantu get realTime Token
router.get("/hantu/realTimeToken", earningsController.getRealTimeToken);

// 실적발표 전체 리스트 + 필터링/정렬/검색
router.get("/", earningsController.getEarningsList);     // /api/earnings

// 실적발표 상세 페이지
router.get("/:symbol", earningsController.getEarningsBySymbol);     // /api/earnings/:symbol

// 실적발표 언어별 콘텐츠 조회 (예: /api/earnings/:id/ko)
router.get("/:id/:lang", earningsController.getEarningsLangContent);


module.exports = router;
