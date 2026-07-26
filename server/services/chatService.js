const ChatMessage = require("../models/ChatMessage");
const Mentor = require("../models/Mentor");
const User = require("../models/User");

async function getMessages(userId, mentorId) {
  return ChatMessage.findMany({
    where: { userId, mentorId },
    orderBy: { createdAt: "asc" },
  });
}

async function sendMessage({ userId, mentorId, senderRole, message }) {
  return ChatMessage.create({
    data: { userId, mentorId, senderRole, message },
  });
}

// Mentor's inbox: one row per learner (or admin) who has messaged them,
// with the latest message for a preview.
async function listThreadsForMentor(mentorId) {
  const messages = await ChatMessage.findMany({
    where: { mentorId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, fullName: true, photo: true, role: true } } },
  });

  const seen = new Map();
  for (const msg of messages) {
    if (!seen.has(msg.userId)) {
      seen.set(msg.userId, {
        userId: msg.userId,
        name: msg.user.fullName,
        photo: msg.user.photo,
        isAdmin: msg.user.role === "ADMIN",
        lastMessage: msg.message,
        lastMessageAt: msg.createdAt,
      });
    }
  }
  return [...seen.values()];
}

// Learner's inbox: one row per mentor they've messaged.
async function listThreadsForUser(userId) {
  const messages = await ChatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { mentor: { select: { id: true, name: true, photo: true } } },
  });

  const seen = new Map();
  for (const msg of messages) {
    if (!seen.has(msg.mentorId)) {
      seen.set(msg.mentorId, {
        mentorId: msg.mentorId,
        name: msg.mentor.name,
        photo: msg.mentor.photo,
        lastMessage: msg.message,
        lastMessageAt: msg.createdAt,
      });
    }
  }
  return [...seen.values()];
}

module.exports = { getMessages, sendMessage, listThreadsForMentor, listThreadsForUser };
