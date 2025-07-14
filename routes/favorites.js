const express = require("express");
const router = express.Router();
const favoritesController = require("../controller/favoritesController");


// 관심 종목 전체 조회
router.get("/", favoritesController.getFavorites);     // /api/favorites

// 관심 종목 추가
router.post("/", favoritesController.addFavorite);     // /api/favorites

// 관심 종목 일괄 등록
router.post("/init", favoritesController.initFavorites);    // /api/favorites/init

// 관심 종목 등록 수 조회
router.get("/count", favoritesController.getFavoriteCount);     // /api/favorites/count

// 관심 종목 삭제 (id로)
router.delete("/:id", favoritesController.deleteFavorite);     // /api/favorites/:id

module.exports = router;