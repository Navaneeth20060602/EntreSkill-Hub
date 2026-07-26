const express = require("express");
const {
  getBusinesses, getBusiness, getRecommendations,
  adminListCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
} = require("../controllers/businessController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getBusinesses);
router.post("/recommendations", getRecommendations);

// Admin course/sub-course management (kept above the "/:id" route so it
// doesn't get swallowed by the generic lookup below).
router.get("/admin/courses", protect, requireRole("ADMIN"), adminListCourses);
router.post("/admin/courses", protect, requireRole("ADMIN"), adminCreateCourse);
router.patch("/admin/courses/:id", protect, requireRole("ADMIN"), adminUpdateCourse);
router.delete("/admin/courses/:id", protect, requireRole("ADMIN"), adminDeleteCourse);

router.get("/:id", getBusiness);

module.exports = router;
