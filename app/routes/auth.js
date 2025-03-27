const express = require("express");
const { signup, sendOtp, verifyOtp, logout } = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);

module.exports = router;

