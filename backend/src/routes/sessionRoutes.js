const express = require("express");
const { getSessions, getSpeakers, getAttendees } = require("../controllers/sessionController");

const router = express.Router();

router.get("/sessions-list", getSessions);
router.get("/speakers-list", getSpeakers);
router.get("/attendees-list", getAttendees);

module.exports = router;
