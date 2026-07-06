const express = require("express");
const {
  getBadgeByRegId,
  getBadgeForUser,
  linkBadge,
} = require("../controllers/badgeController");

const router = express.Router();

router.get("/me", getBadgeForUser);
router.get("/:regId", getBadgeByRegId);
router.post("/link", linkBadge);

module.exports = router;
