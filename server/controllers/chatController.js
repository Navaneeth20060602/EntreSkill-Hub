const asyncHandler = require("express-async-handler");
const chatService = require("../services/chatService");
const mentorService = require("../services/mentorService");
const { sendSuccess, sendError } = require("../utils/response");

// Learner side - chatting with a specific mentor by mentorId.
const getMessagesWithMentor = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.user.id, req.params.mentorId);
  sendSuccess(res, { data: { messages } });
});

const sendMessageToMentor = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return sendError(res, { status: 400, message: "Message cannot be empty." });

  const saved = await chatService.sendMessage({
    userId: req.user.id,
    mentorId: req.params.mentorId,
    senderRole: "USER",
    message,
  });
  sendSuccess(res, { status: 201, data: { message: saved } });
});

const getMyThreadsAsUser = asyncHandler(async (req, res) => {
  const threads = await chatService.listThreadsForUser(req.user.id);
  sendSuccess(res, { data: { threads } });
});

// Mentor side - chatting with a specific learner by userId.
const getMessagesWithUser = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const messages = await chatService.getMessages(req.params.userId, mentor.id);
  sendSuccess(res, { data: { messages } });
});

const sendMessageToUser = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { message } = req.body;
  if (!message?.trim()) return sendError(res, { status: 400, message: "Message cannot be empty." });

  const saved = await chatService.sendMessage({
    userId: req.params.userId,
    mentorId: mentor.id,
    senderRole: "MENTOR",
    message,
  });
  sendSuccess(res, { status: 201, data: { message: saved } });
});

const getMyThreadsAsMentor = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const threads = await chatService.listThreadsForMentor(mentor.id);
  sendSuccess(res, { data: { threads } });
});

// Admin side - admin can message any mentor directly; the mentor sees it
// labeled as coming from the admin, not from a learner.
const getMessagesWithMentorAsAdmin = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.user.id, req.params.mentorId);
  sendSuccess(res, { data: { messages } });
});

const sendMessageToMentorAsAdmin = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return sendError(res, { status: 400, message: "Message cannot be empty." });

  const saved = await chatService.sendMessage({
    userId: req.user.id,
    mentorId: req.params.mentorId,
    senderRole: "ADMIN",
    message,
  });
  sendSuccess(res, { status: 201, data: { message: saved } });
});

module.exports = {
  getMessagesWithMentor, sendMessageToMentor, getMyThreadsAsUser,
  getMessagesWithUser, sendMessageToUser, getMyThreadsAsMentor,
  getMessagesWithMentorAsAdmin, sendMessageToMentorAsAdmin,
};
