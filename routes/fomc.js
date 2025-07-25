const express = require("express");
const router = express.Router();
const fomcController = require("../controller/fomcController");

router.get("/decisions", fomcController.getFomcDecisionsList); // /api/fomc/decisions

router.get("/minutes", fomcController.getFomcMinutesList); // /api/fomc/minutes

router.get("/decisions/:id", fomcController.getFomcDecisions); // /api/fomc/decisions/:id

router.get("/minutes/:id", fomcController.getFomcminutes); // /api/fomc/minutes/:id

module.exports = router;
