const express = require("express");
const {
  createPaper, getMyPapers, deletePaper, assignPaperToStudent,
  addQuestion, deleteQuestion, getMyQuestions,
  getExamQuestions, submitExam,
  scheduleInterview, recordInterview,
  getMyEnrollments, markResourcesDone,
  getPendingApprovals, getEnrollmentsForUser, approveCompletion,
} = require("../controllers/examController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Admin - approve mentor-recorded results before a course is officially done
router.get("/pending-approvals", requireRole("ADMIN"), getPendingApprovals);
router.get("/enrollments/user/:userId", requireRole("ADMIN"), getEnrollmentsForUser);
router.post("/pending-approvals/:id/approve", requireRole("ADMIN"), approveCompletion);

// Mentor - papers, question paper management, interview scheduling/results
router.post("/papers", requireRole("MENTOR"), createPaper);
router.get("/papers/mine", requireRole("MENTOR"), getMyPapers);
router.delete("/papers/:id", requireRole("MENTOR"), deletePaper);
router.post("/papers/assign", requireRole("MENTOR"), assignPaperToStudent);

router.post("/questions", requireRole("MENTOR"), addQuestion);
router.delete("/questions/:id", requireRole("MENTOR"), deleteQuestion);
router.get("/questions/mine", requireRole("MENTOR"), getMyQuestions);

router.post("/interview-schedule", requireRole("MENTOR"), scheduleInterview);
router.post("/interview-result", requireRole("MENTOR"), recordInterview);

// Learner - take exam, view progress
router.get("/questions/:businessTitle", requireRole("USER"), getExamQuestions);
router.post("/submit", requireRole("USER"), submitExam);
router.get("/enrollments", requireRole("USER"), getMyEnrollments);
router.post("/resources-done", requireRole("USER"), markResourcesDone);

module.exports = router;
