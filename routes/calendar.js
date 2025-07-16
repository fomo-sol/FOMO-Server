const express = require("express");
const router = express.Router();
const calendarController = require("../controller/calendarController");

// GET /api/calendar?date=YYYYMMDD
router.get("/week", calendarController.getWeekCalendar);     // /api/calendar/week

module.exports = router;
