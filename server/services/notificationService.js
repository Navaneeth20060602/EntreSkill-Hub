const Notification = require("../models/Notification");

async function create(userId, message, link) {
  if (!userId) return null;
  return Notification.create({ data: { userId, message, link: link || null } });
}

async function listForUser(userId) {
  return Notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function unreadCount(userId) {
  return Notification.count({ where: { userId, read: false } });
}

async function markRead(id, userId) {
  return Notification.updateMany({ where: { id, userId }, data: { read: true } });
}

async function markAllRead(userId) {
  return Notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

module.exports = {
  create,
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
};
