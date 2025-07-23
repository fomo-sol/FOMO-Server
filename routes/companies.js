const express = require("express");
const router = express.Router();
const companiesController = require("../controller/companiesController");

// 전체 기업 목록 또는 검색
router.get("/", companiesController.getCompanies);     // /api/companies

router.get("/search", companiesController.getSearchCompanies);

module.exports = router;