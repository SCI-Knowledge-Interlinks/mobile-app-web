const express = require("express");
const { getFaqs } = require("../controllers/faqController");

const router = express.Router();

router.get("/faq-list", getFaqs);

module.exports = router;
