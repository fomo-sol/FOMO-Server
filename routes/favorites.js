const express = require("express");
const router = express.Router();
const favoritesController = require("../controller/favoritesController");

// 관심 종목 전체 조회
router.get("/:user_id", favoritesController.getFavorites);

// 관심 종목 추가 (단일/일괄)
router.post("/:user_id", favoritesController.addFavorites);

// 관심 종목 삭제 (body에 stock_id)
router.delete("/:user_id", favoritesController.deleteFavorite);

module.exports = router;