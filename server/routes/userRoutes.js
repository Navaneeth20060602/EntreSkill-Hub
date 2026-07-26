const express = require("express");
const { updateMe } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { uploadProfilePhoto } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.patch("/me", protect, uploadProfilePhoto.single("photo"), updateMe);

module.exports = router;
