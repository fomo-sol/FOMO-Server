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

router.post("/earnings/prealarm", controller.notifyEarningsPreAlarm); // 하루 전 알림
router.post("/earnings/summary", controller.notifyEarningsSummaryUpload); // 요약 업로드 알림

module.exports = router;
