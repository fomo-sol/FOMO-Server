const express = require("express");
const router = express.Router();
const fomcController = require("../controller/fomcController");

router.get("/decisions", fomcController.getFomcDecisionsList); // /api/fomc/decisions

router.get("/minutes", fomcController.getFomcMinutesList); // /api/fomc/minutes

router.get("/decisions/:id", fomcController.getFomcDecisions); // /api/fomc/decisions/:id

router.get("/minutes/:id", fomcController.getFomcminutes); // /api/fomc/minutes/:id

// 날짜 기반 매칭 API
router.get(
  "/decisions/:date/minutes",
  fomcController.getFomcMinutesByDecisionDate
);
router.get(
  "/minutes/:date/decision",
  fomcController.getFomcDecisionByMinutesDate
);

// /api/fomc/fomc-all-date
router.get("/fomc-all-date", fomcController.getFomcAllDate);

module.exports = router;
