const express = require("express");
const router = express.Router();
const earningsController = require("../controller/earningsController");

// 실적발표 전체 리스트 + 필터링/정렬/검색
router.get("/", earningsController.getEarningsList);     // /api/earnings

// 실적발표 상세 페이지
router.get("/:id", earningsController.getEarningsById);     // /api/earnings/:id

// 실적발표 언어별 콘텐츠 조회 (예: /api/earnings/:id/ko)
router.get("/:id/:lang", earningsController.getEarningsLangContent);

module.exports = router;
