const express = require("express");
const {
  getMyNotifications, markNotificationRead, markAllNotificationsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/mine", getMyNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

module.exports = router;
