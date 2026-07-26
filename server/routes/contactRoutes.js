const express = require("express");
const {
  submitMessage, getMyMessages, getAllMessages, respondToMessage, closeTicket,
  transferMessage, getMyAssignedComplaints, addMentorNote,
} = require("../controllers/contactController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", submitMessage);
router.get("/mine", getMyMessages);

router.get("/assigned/mine", requireRole("MENTOR"), getMyAssignedComplaints);
router.patch("/:id/mentor-note", requireRole("MENTOR"), addMentorNote);

router.get("/", requireRole("ADMIN"), getAllMessages);
router.patch("/:id/respond", requireRole("ADMIN"), respondToMessage);
router.patch("/:id/close", requireRole("ADMIN"), closeTicket);
router.patch("/:id/transfer", requireRole("ADMIN"), transferMessage);

module.exports = router;
