const express = require("express");
const { getUsers, getFeedback, getStats, sendMentorLoginOtp, createMentorLogin } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, requireRole("ADMIN"));

router.get("/users", getUsers);
router.get("/feedback", getFeedback);
router.get("/stats", getStats);
router.post("/mentors/send-login-otp", sendMentorLoginOtp);
router.post("/mentors/:mentorId/create-login", createMentorLogin);

module.exports = router;
