const express = require("express");
const router = express.Router();
const controller = require("../controller/notificationsController");
const authMiddleware = require("../common/middlewareAuth");

router.get("/", controller.getNotifications); // /api/notifications?filter=all
router.get("/latest", controller.getLatestNotification); // /api/notifications/latest

router.post("/push-test", authMiddleware, controller.sendTestNotification);
router.post("/notify", controller.notifyByStatementDate);
router.post("/prealarm", controller.notifyFomcPreAlarm);
router.post("/uploaded", controller.notifyFomcUploadAlarm);

module.exports = router;
