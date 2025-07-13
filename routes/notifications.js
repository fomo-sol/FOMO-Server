const express = require("express");
const router = express.Router();
const controller = require("../controller/notificationsController");

router.get("/", controller.getNotifications); // /api/notifications?filter=all
router.get("/latest", controller.getLatestNotification); // /api/notifications/latest

module.exports = router;
