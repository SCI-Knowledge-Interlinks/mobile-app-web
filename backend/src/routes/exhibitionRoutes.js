const express = require("express");
const router = express.Router();
const { getExhibitions } = require("../controllers/exhibitionController");

router.get("/", getExhibitions);

module.exports = router;
