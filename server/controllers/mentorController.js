const asyncHandler = require("express-async-handler");
const mentorService = require("../services/mentorService");
const { sendSuccess, sendError } = require("../utils/response");

const getMentors = asyncHandler(async (req, res) => {
  const { specialization } = req.query;
  const mentors = await mentorService.listMentors(specialization);
  sendSuccess(res, { data: { mentors } });
});

const getMentorPublicProfile = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorById(req.params.id);
  if (!mentor) return sendError(res, { status: 404, message: "Mentor not found." });
  sendSuccess(res, { data: { mentor } });
});

const getMyAssignedMentor = asyncHandler(async (req, res) => {
  if (!req.user.assignedMentorId) {
    return sendSuccess(res, { data: { mentor: null } });
  }
  const mentor = await mentorService.getMentorById(req.user.assignedMentorId);
  sendSuccess(res, { data: { mentor } });
});

const getMentorProfile = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });
  const feedbacks = await mentorService.listFeedbackForMentor(mentor.id);
  sendSuccess(res, { data: { mentor, feedbacks } });
});

const getMyStudents = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });
  const students = await mentorService.getStudentsForMentor(mentor.id);
  sendSuccess(res, { data: { students } });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const data = {};
  ["bio", "experience", "location", "phone"].forEach((field) => {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  });
  if (req.file) data.photo = `/uploads/profiles/${req.file.filename}`;

  const updated = await mentorService.updateMentor(mentor.id, data);
  sendSuccess(res, { message: "Profile updated.", data: { mentor: updated } });
});

const createMentor = asyncHandler(async (req, res) => {
  const { name, specialization, experience, location, email, phone, bio } = req.body;
  const photo = req.file ? `/uploads/mentors/${req.file.filename}` : req.body.photo || null;
  const mentor = await mentorService.createMentor({
    name, specialization, experience, location, email, phone, bio, photo,
  });
  sendSuccess(res, { status: 201, message: "Mentor added.", data: { mentor } });
});

const updateMentor = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.photo = `/uploads/mentors/${req.file.filename}`;
  const mentor = await mentorService.updateMentor(req.params.id, data);
  sendSuccess(res, { message: "Mentor updated.", data: { mentor } });
});

const deleteMentor = asyncHandler(async (req, res) => {
  await mentorService.deleteMentor(req.params.id);
  sendSuccess(res, { message: "Mentor removed." });
});

// A mentor may only add resources under their own specialization, scoped to
// one specific sub-skill/business (not the whole skill category), and can
// share a video, an external link, or written notes/a document.
const addMyResource = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { title, description, businessTitle, noteText } = req.body;
  const contentType = req.body.contentType || (req.file ? "video" : "link");
  const url = req.file ? `/uploads/resources/${req.file.filename}` : req.body.url;

  if (!title || !businessTitle) {
    return sendError(res, { status: 400, message: "Title and the sub-skill are required." });
  }
  if (contentType !== "notes" && !url) {
    return sendError(res, { status: 400, message: "A video file or URL is required." });
  }
  if (contentType === "notes" && !url && !noteText) {
    return sendError(res, { status: 400, message: "Add either a note file or written notes text." });
  }

  const resource = await mentorService.addResource(mentor.id, { title, url, noteText, description, businessTitle, contentType });
  sendSuccess(res, { status: 201, message: "Resource added.", data: { resource } });
});

const updateMyResource = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const data = {};
  ["title", "description", "businessTitle", "noteText", "contentType"].forEach((field) => {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  });
  if (req.file) {
    data.url = `/uploads/resources/${req.file.filename}`;
  } else if (req.body.url) {
    data.url = req.body.url;
  }

  const resource = await mentorService.updateResource(req.params.id, mentor.id, data);
  if (!resource) return sendError(res, { status: 404, message: "Resource not found." });
  sendSuccess(res, { message: "Resource updated.", data: { resource } });
});

const getResources = asyncHandler(async (req, res) => {
  const { businessTitle } = req.query;
  const resources = await mentorService.listResources(businessTitle);
  sendSuccess(res, { data: { resources } });
});

const deleteMyResource = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });
  await mentorService.deleteResource(req.params.id, mentor.id);
  sendSuccess(res, { message: "Resource removed." });
});

const rateResource = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return sendError(res, { status: 400, message: "Rating must be between 1 and 5." });
  }
  const result = await mentorService.rateResource(req.params.id, req.user.id, Number(rating));
  sendSuccess(res, { message: "Thanks for rating this resource!", data: result });
});

const addFeedback = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  if (!message) return sendError(res, { status: 400, message: "Feedback message is required." });
  const feedback = await mentorService.addFeedback(req.user.id, {
    mentorId: req.params.id,
    message,
    rating: rating ? Number(rating) : 5,
  });
  sendSuccess(res, { status: 201, message: "Thanks for your feedback!", data: { feedback } });
});

// --- Admin: approve mentor-uploaded training content ---
const getPendingResources = asyncHandler(async (req, res) => {
  const resources = await mentorService.listPendingResources();
  sendSuccess(res, { data: { resources } });
});

const approveResource = asyncHandler(async (req, res) => {
  const resource = await mentorService.approveResource(req.params.id);
  sendSuccess(res, { message: "Resource approved and now visible to learners.", data: { resource } });
});

const rejectResource = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return sendError(res, { status: 400, message: "A reason is required so the mentor knows what to fix." });
  }
  const resource = await mentorService.rejectResource(req.params.id, reason.trim());
  sendSuccess(res, { message: "Resource rejected. The mentor has been notified with your reason.", data: { resource } });
});

module.exports = {
  getMentors,
  getMentorPublicProfile,
  getMyAssignedMentor,
  getMentorProfile,
  getMyStudents,
  updateMyProfile,
  createMentor,
  updateMentor,
  deleteMentor,
  addMyResource,
  updateMyResource,
  getResources,
  getPendingResources,
  approveResource,
  rejectResource,
  deleteMyResource,
  rateResource,
  addFeedback,
};
