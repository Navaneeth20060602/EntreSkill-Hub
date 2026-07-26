const express = require("express");
const { getRoadmap, getMyProgress, saveMyProgress } = require("../controllers/roadmapController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:businessId", getRoadmap);
router.get("/:businessId/progress", protect, getMyProgress);
router.post("/:businessId/progress", protect, saveMyProgress);

module.exports = router;
