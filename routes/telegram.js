const express = require("express");
const router = express.Router();
const telegramController = require("../controller/telegramController");

router.post("/subscribe", telegramController.subscribeTelegram);

module.exports = router;