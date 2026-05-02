const express = require("express");
const {
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} = require("../controllers/whatsappController");

const router = express.Router();

router.post("/send-otp", sendWhatsAppOtp);
router.post("/verify-otp", verifyWhatsAppOtp);

module.exports = router;
