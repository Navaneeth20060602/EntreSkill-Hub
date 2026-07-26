const asyncHandler = require("express-async-handler");
const contactService = require("../services/contactService");
const mentorService = require("../services/mentorService");
const { sendSuccess, sendError } = require("../utils/response");

const submitMessage = asyncHandler(async (req, res) => {
  if (req.user.role === "ADMIN") {
    return sendError(res, { status: 403, message: "Admins can't submit feedback or complaints." });
  }

  const { type, subject, message, rating } = req.body;
  const validTypes = ["FEEDBACK", "SUGGESTION", "COMPLAINT"];

  if (!validTypes.includes(type)) {
    return sendError(res, { status: 400, message: "Invalid message type." });
  }
  if (!subject || !message) {
    return sendError(res, { status: 400, message: "Subject and message are required." });
  }

  const created = await contactService.submitMessage(req.user.id, { type, subject, message, rating });
  sendSuccess(res, { status: 201, message: "Thank you! Your message has been sent.", data: { contactMessage: created } });
});

const getMyMessages = asyncHandler(async (req, res) => {
  const messages = await contactService.listMyMessages(req.user.id);
  sendSuccess(res, { data: { messages } });
});

const getAllMessages = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const messages = await contactService.listAll(type);
  sendSuccess(res, { data: { messages } });
});

const respondToMessage = asyncHandler(async (req, res) => {
  const { response } = req.body;
  if (!response) return sendError(res, { status: 400, message: "A response message is required." });

  const updated = await contactService.respond(req.params.id, response);
  sendSuccess(res, { message: "Response sent.", data: { contactMessage: updated } });
});

const closeTicket = asyncHandler(async (req, res) => {
  const updated = await contactService.closeTicket(req.params.id);
  sendSuccess(res, { message: "Ticket closed.", data: { contactMessage: updated } });
});

const transferMessage = asyncHandler(async (req, res) => {
  const updated = await contactService.transferToMentor(req.params.id);
  sendSuccess(res, { message: "Complaint transferred to the learner's mentor.", data: { contactMessage: updated } });
});

// --- Mentor side: complaints transferred to them, with no learner identity ---
const getMyAssignedComplaints = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const messages = await contactService.listTransferredToMentor(mentor.id);
  sendSuccess(res, { data: { messages } });
});

const addMentorNote = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { note } = req.body;
  if (!note) return sendError(res, { status: 400, message: "A note is required." });

  const updated = await contactService.addMentorNote(req.params.id, mentor.id, note);
  if (!updated) return sendError(res, { status: 404, message: "Complaint not found." });
  sendSuccess(res, { message: "Note saved for the admin.", data: { contactMessage: updated } });
});

module.exports = {
  submitMessage, getMyMessages, getAllMessages, respondToMessage, closeTicket,
  transferMessage, getMyAssignedComplaints, addMentorNote,
};
