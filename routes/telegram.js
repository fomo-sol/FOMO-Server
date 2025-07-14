const express = require("express");
const router = express.Router();
const controller = require("../controller/telegramController");

router.post("/subscribe", controller.subscribeUser); // /api/telegram/subscribe

module.exports = router;