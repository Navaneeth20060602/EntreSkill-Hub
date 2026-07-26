const express = require("express");
const {
  register, login, logout, getMe, sendOtp, verifyOtp,
  forgotPassword, resetPassword, changePassword, googleLogin,
} = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/send-otp", authLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/change-password", protect, changePassword);
router.post("/google", authLimiter, googleLogin);

module.exports = router;
