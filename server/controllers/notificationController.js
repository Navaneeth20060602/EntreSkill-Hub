const asyncHandler = require("express-async-handler");
const notificationService = require("../services/notificationService");
const { sendSuccess } = require("../utils/response");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listForUser(req.user.id);
  const unread = await notificationService.unreadCount(req.user.id);
  sendSuccess(res, { data: { notifications, unread } });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.params.id, req.user.id);
  sendSuccess(res, { message: "Marked as read." });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  sendSuccess(res, { message: "All notifications marked as read." });
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
