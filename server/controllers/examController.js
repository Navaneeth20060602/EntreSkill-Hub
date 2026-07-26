const asyncHandler = require("express-async-handler");
const examService = require("../services/examService");
const enrollmentService = require("../services/enrollmentService");
const mentorService = require("../services/mentorService");
const { sendSuccess, sendError } = require("../utils/response");

// --- Mentor: manage question papers ---
const createPaper = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { businessTitle, title } = req.body;
  if (!businessTitle || !title) return sendError(res, { status: 400, message: "businessTitle and title are required." });

  const paper = await examService.createPaper(mentor.id, { businessTitle, title });
  sendSuccess(res, { status: 201, message: "Question paper created.", data: { paper } });
});

const getMyPapers = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { businessTitle } = req.query;
  const papers = await examService.listPapersForMentor(mentor.id, businessTitle);
  sendSuccess(res, { data: { papers } });
});

const deletePaper = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });
  await examService.deletePaper(req.params.id, mentor.id);
  sendSuccess(res, { message: "Question paper removed." });
});

const assignPaperToStudent = asyncHandler(async (req, res) => {
  const { userId, businessTitle, skill, paperId } = req.body;
  if (!userId || !businessTitle || !skill || !paperId) {
    return sendError(res, { status: 400, message: "userId, businessTitle, skill and paperId are required." });
  }
  try {
    const enrollment = await enrollmentService.assignPaper(userId, businessTitle, skill, paperId);
    sendSuccess(res, { message: "Paper assigned to student.", data: { enrollment } });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

// --- Mentor: manage individual questions within a paper ---
const addQuestion = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { businessTitle, paperId, question, options, correctIndex } = req.body;
  if (!businessTitle || !question || !Array.isArray(options) || options.length < 2 || correctIndex === undefined) {
    return sendError(res, { status: 400, message: "businessTitle, question, at least 2 options and correctIndex are required." });
  }

  const created = await examService.addQuestion(mentor.id, { businessTitle, paperId, question, options, correctIndex });
  sendSuccess(res, { status: 201, message: "Question added.", data: { question: created } });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });
  await examService.deleteQuestion(req.params.id, mentor.id);
  sendSuccess(res, { message: "Question removed." });
});

const getMyQuestions = asyncHandler(async (req, res) => {
  const mentor = await mentorService.getMentorByUserId(req.user.id);
  if (!mentor) return sendError(res, { status: 404, message: "No mentor profile linked to this account." });

  const { businessTitle } = req.query;
  const questions = await examService.listQuestionsForMentor(mentor.id, businessTitle);
  sendSuccess(res, { data: { questions } });
});

// --- Learner: take exam ---
const getExamQuestions = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.getEnrollment(req.user.id, req.params.businessTitle);

  if (enrollment?.examPassed) {
    return sendError(res, { status: 400, message: "You've already passed this exam. Check your dashboard for your interview status." });
  }

  const questions = await examService.listQuestionsForExam(req.params.businessTitle, enrollment?.assignedPaperId);
  sendSuccess(res, { data: { questions } });
});

const submitExam = asyncHandler(async (req, res) => {
  const { businessTitle, skill, answers } = req.body;
  if (!businessTitle || !skill || !answers) {
    return sendError(res, { status: 400, message: "businessTitle, skill and answers are required." });
  }

  const enrollment = await enrollmentService.getEnrollment(req.user.id, businessTitle);
  if (enrollment?.examPassed) {
    return sendError(res, { status: 400, message: "You've already passed this exam." });
  }

  const { score, total } = await examService.gradeExam(businessTitle, enrollment?.assignedPaperId, answers);

  if (total === 0) {
    return sendError(res, { status: 400, message: "No exam has been published for this course yet." });
  }

  const updatedEnrollment = await enrollmentService.recordExamResult(req.user.id, businessTitle, skill, { score, total });
  sendSuccess(res, {
    message: `You scored ${score}/${total}.`,
    data: { score, total, passed: updatedEnrollment.examPassed, enrollment: updatedEnrollment },
  });
});

// --- Mentor: schedule + record interview ---
const scheduleInterview = asyncHandler(async (req, res) => {
  const { userId, businessTitle, skill, meetLink, scheduledAt } = req.body;
  if (!userId || !businessTitle || !skill || !meetLink || !scheduledAt) {
    return sendError(res, { status: 400, message: "userId, businessTitle, skill, meetLink and a date/time are all required." });
  }
  try {
    const before = await enrollmentService.getEnrollment(userId, businessTitle);
    if (before?.interviewPassed) {
      return sendError(res, { status: 400, message: "This student has already passed their interview for this course - it can't be rescheduled." });
    }
    const wasAlreadyScheduled = before?.interviewStatus === "SCHEDULED";

    const enrollment = await enrollmentService.scheduleInterview(userId, businessTitle, skill, { meetLink, scheduledAt });
    sendSuccess(res, {
      message: wasAlreadyScheduled ? "Interview rescheduled." : "Interview scheduled.",
      data: { enrollment },
    });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

const recordInterview = asyncHandler(async (req, res) => {
  const { userId, businessTitle, skill, score, meetLink } = req.body;
  if (!userId || !businessTitle || !skill) {
    return sendError(res, { status: 400, message: "userId, businessTitle and skill are required." });
  }

  try {
    const enrollment = await enrollmentService.recordInterviewResult(userId, businessTitle, skill, {
      score,
      meetLink,
    });
    sendSuccess(res, {
      message: enrollment.interviewPassed ? "Interview passed!" : "Interview result saved.",
      data: { enrollment },
    });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

// --- Admin: review + approve completed courses ---
const getPendingApprovals = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.listPendingApproval();
  sendSuccess(res, { data: { enrollments } });
});

const getEnrollmentsForUser = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.listForUser(req.params.userId);
  sendSuccess(res, { data: { enrollments } });
});

const approveCompletion = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.approveCompletion(req.params.id);
  sendSuccess(res, { message: "Course marked as completed for this learner.", data: { enrollment } });
});

// --- Learner: view their enrollment/marks ---
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.listForUser(req.user.id);
  sendSuccess(res, { data: { enrollments } });
});

const markResourcesDone = asyncHandler(async (req, res) => {
  const { businessTitle, skill } = req.body;
  if (!businessTitle || !skill) return sendError(res, { status: 400, message: "businessTitle and skill are required." });

  const enrollment = await enrollmentService.markResourcesCompleted(req.user.id, businessTitle, skill);
  sendSuccess(res, { message: "Resources marked as completed.", data: { enrollment } });
});

module.exports = {
  createPaper, getMyPapers, deletePaper, assignPaperToStudent,
  addQuestion, deleteQuestion, getMyQuestions,
  getExamQuestions, submitExam,
  scheduleInterview, recordInterview,
  getMyEnrollments, markResourcesDone,
  getPendingApprovals, getEnrollmentsForUser, approveCompletion,
};
