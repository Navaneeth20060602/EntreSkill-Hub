const express = require("express");
const {
  getProfile,
  updateSkills,
  updateSelectedBusiness,
  updateProgressSteps,
  updateResourcesCompleted,
  toggleBookmark,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.put("/skills", updateSkills);
router.put("/business", updateSelectedBusiness);
router.put("/progress", updateProgressSteps);
router.put("/resources-completed", updateResourcesCompleted);
router.post("/bookmark/:businessId", toggleBookmark);

module.exports = router;
