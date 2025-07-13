const express = require("express");
const router = express.Router();
const calendarController = require("../controller/calendarController");

// GET /api/calendar?date=YYYYMMDD
router.get("/", calendarController.getCalendarByDate);     // /api/calendar

module.exports = router;