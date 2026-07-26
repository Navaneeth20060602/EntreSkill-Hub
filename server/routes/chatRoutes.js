const express = require("express");
const {
  getMessagesWithMentor, sendMessageToMentor, getMyThreadsAsUser,
  getMessagesWithUser, sendMessageToUser, getMyThreadsAsMentor,
  getMessagesWithMentorAsAdmin, sendMessageToMentorAsAdmin,
} = require("../controllers/chatController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Learner routes
router.get("/threads", requireRole("USER"), getMyThreadsAsUser);
router.get("/mentor/:mentorId", requireRole("USER"), getMessagesWithMentor);
router.post("/mentor/:mentorId", requireRole("USER"), sendMessageToMentor);

// Mentor routes
router.get("/mentor-threads", requireRole("MENTOR"), getMyThreadsAsMentor);
router.get("/user/:userId", requireRole("MENTOR"), getMessagesWithUser);
router.post("/user/:userId", requireRole("MENTOR"), sendMessageToUser);

// Admin routes - admin can message any mentor directly
router.get("/admin/mentor/:mentorId", requireRole("ADMIN"), getMessagesWithMentorAsAdmin);
router.post("/admin/mentor/:mentorId", requireRole("ADMIN"), sendMessageToMentorAsAdmin);

module.exports = router;
