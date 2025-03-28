const express = require("express");
const { signup, login, logout, forgotPassword } = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);

module.exports = router;
