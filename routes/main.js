const express = require("express");
const router = express.Router();
const mainController = require("../controller/mainController");

router.get("", mainController.getMain);     // /api/main

module.exports = router;