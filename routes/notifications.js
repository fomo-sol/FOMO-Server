const express = require("express");
const router = express.Router();
const controller = require("../controller/notificationsController");
const authMiddleware = require("../common/middlewareAuth");

router.get("/", controller.getNotifications); // /api/notifications?filter=all
router.get("/latest", controller.getLatestNotification); // /api/notifications/latest

router.post("/push-test", authMiddleware, controller.sendTestNotification);

module.exports = router;
