const express = require("express");
const router = express.Router();
const fomcController = require("../controller/fomcController");

router.get("/decisions", fomcController.getFomcDecisionsList);              // /api/fomc/decisions

router.get("/minutes", fomcController.getFomcMinutesList);                  // /api/fomc/minutes


router.get("/:id/:type", fomcController.getFomcType);     // /api/fomc/:id/:type

router.get("/:id/:type/:lang", fomcController.getFomcContentByLang);     // /api/fomc/:id/:type/:lang

module.exports = router;