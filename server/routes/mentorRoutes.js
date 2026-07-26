const express = require("express");
const {
  getMentors,
  getMentorPublicProfile,
  getMyAssignedMentor,
  getMentorProfile,
  getMyStudents,
  updateMyProfile,
  createMentor,
  updateMentor,
  deleteMentor,
  addMyResource,
  updateMyResource,
  getResources,
  getPendingResources,
  approveResource,
  rejectResource,
  deleteMyResource,
  rateResource,
  addFeedback,
} = require("../controllers/mentorController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { uploadMentorPhoto, uploadResourceVideo, uploadProfilePhoto } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getMentors);
router.get("/resources", getResources);

// Learner-only
router.get("/assigned/me", protect, requireRole("USER"), getMyAssignedMentor);
router.post("/resources/:id/rate", protect, requireRole("USER"), rateResource);

// Mentor-only (must come before "/:id" style admin routes to avoid collisions)
router.get("/me/profile", protect, requireRole("MENTOR"), getMentorProfile);
router.get("/me/students", protect, requireRole("MENTOR"), getMyStudents);
router.patch("/me/profile", protect, requireRole("MENTOR"), uploadProfilePhoto.single("photo"), updateMyProfile);
router.post("/me/resources", protect, requireRole("MENTOR"), uploadResourceVideo.single("file"), addMyResource);
router.patch("/me/resources/:id", protect, requireRole("MENTOR"), uploadResourceVideo.single("file"), updateMyResource);
router.delete("/me/resources/:id", protect, requireRole("MENTOR"), deleteMyResource);

// Any logged-in user
router.post("/:id/feedback", protect, addFeedback);

router.get("/:id", getMentorPublicProfile);

// Admin-only mentor directory management
router.post("/", protect, requireRole("ADMIN"), uploadMentorPhoto.single("photo"), createMentor);
router.patch("/:id", protect, requireRole("ADMIN"), uploadMentorPhoto.single("photo"), updateMentor);
router.delete("/:id", protect, requireRole("ADMIN"), deleteMentor);
router.get("/resources/pending/all", protect, requireRole("ADMIN"), getPendingResources);
router.post("/resources/:id/approve", protect, requireRole("ADMIN"), approveResource);
router.post("/resources/:id/reject", protect, requireRole("ADMIN"), rejectResource);

module.exports = router;
