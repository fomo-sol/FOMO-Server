const express = require("express");
const router = express.Router();
const fomcController = require("../controller/fomcController");

router.get("/", fomcController.getFomcList);              // /api/fomc
router.get("/:id", fomcController.getFomcById);           // /api/fomc/:id
router.get("/:id/:type", fomcController.getFomcType);     // /api/fomc/:id/:type
router.get("/:id/:type/:lang", fomcController.getFomcContentByLang);     // /api/fomc/:id/:type/:lang

module.exports = router;