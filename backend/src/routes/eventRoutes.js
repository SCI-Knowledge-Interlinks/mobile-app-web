const express = require("express");
const { getEvents, getCurrentEvent } = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEvents);
router.get("/current", getCurrentEvent);

module.exports = router;
