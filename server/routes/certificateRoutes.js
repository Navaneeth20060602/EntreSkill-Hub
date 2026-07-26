const express = require("express");
const { issueCertificate, getMyCertificates, getAllCertificates } = require("../controllers/certificateController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { uploadCertificate } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);

router.get("/mine", requireRole("USER"), getMyCertificates);
router.get("/", requireRole("ADMIN"), getAllCertificates);
router.post("/", requireRole("ADMIN"), uploadCertificate.single("file"), issueCertificate);

module.exports = router;
