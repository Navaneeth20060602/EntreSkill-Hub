const BusinessEnrollment = require("../models/BusinessEnrollment");
const User = require("../models/User");
const ExamPaper = require("../models/ExamPaper");
const notificationService = require("./notificationService");

function blockIfLocked(enrollment) {
  if (enrollment?.status === "COMPLETED") {
    const error = new Error("This course is already completed and certified - its results can no longer be changed.");
    error.status = 400;
    throw error;
  }
}

async function assertUserExists(userId) {
  const user = await User.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("No student found with that ID. Double-check the ID from the My Students tab.");
    error.status = 404;
    throw error;
  }
  return user;
}

async function getOrCreate(userId, businessTitle, skill) {
  return BusinessEnrollment.upsert({
    where: { userId_businessTitle: { userId, businessTitle } },
    update: {},
    create: { userId, businessTitle, skill },
  });
}

async function getEnrollment(userId, businessTitle) {
  return BusinessEnrollment.findUnique({
    where: { userId_businessTitle: { userId, businessTitle } },
    include: { assignedPaper: true },
  });
}

async function listForUser(userId) {
  return BusinessEnrollment.findMany({ where: { userId } });
}

async function markResourcesCompleted(userId, businessTitle, skill) {
  return BusinessEnrollment.upsert({
    where: { userId_businessTitle: { userId, businessTitle } },
    update: { resourcesCompleted: true },
    create: { userId, businessTitle, skill, resourcesCompleted: true },
  });
}

// A mentor assigns one specific question paper to one specific student -
// only a paper written for that exact course, and only while the course
// isn't already finished.
async function assignPaper(userId, businessTitle, skill, paperId) {
  await assertUserExists(userId);

  const paper = await ExamPaper.findUnique({ where: { id: paperId } });
  if (!paper || paper.businessTitle !== businessTitle) {
    const error = new Error("That question paper doesn't belong to this course.");
    error.status = 400;
    throw error;
  }

  const existing = await getEnrollment(userId, businessTitle);
  blockIfLocked(existing);

  if (existing?.examPassed) {
    const error = new Error("This student has already completed and passed the final exam for this course - a paper can't be reassigned.");
    error.status = 400;
    throw error;
  }

  return BusinessEnrollment.upsert({
    where: { userId_businessTitle: { userId, businessTitle } },
    update: { assignedPaperId: paperId },
    create: { userId, businessTitle, skill, assignedPaperId: paperId },
  });
}

const PASS_PERCENT = 75;

async function recordExamResult(userId, businessTitle, skill, { score, total }) {
  const existing = await getEnrollment(userId, businessTitle);
  blockIfLocked(existing);

  // Once already passed, retaking the exam should not be allowed to
  // overwrite a pass with a worse later attempt - the learner is already
  // through to the interview stage.
  if (existing?.examPassed) {
    return existing;
  }

  const passed = total > 0 && (score / total) * 100 >= PASS_PERCENT;

  return BusinessEnrollment.upsert({
    where: { userId_businessTitle: { userId, businessTitle } },
    update: {
      examScore: score,
      examTotal: total,
      examPassed: passed,
      examAttempts: (existing?.examAttempts || 0) + 1,
    },
    create: {
      userId, businessTitle, skill,
      examScore: score, examTotal: total, examPassed: passed, examAttempts: 1,
    },
  });
}

const MAX_INTERVIEW_ATTEMPTS = 2;

// Mentor schedules an interview - sets the Google Meet link AND a specific
// date/time, and marks the enrollment as SCHEDULED so the learner sees it
// clearly. A link with no date/time does not count as "scheduled".
async function scheduleInterview(userId, businessTitle, skill, { meetLink, scheduledAt }) {
  await assertUserExists(userId);

  if (!scheduledAt) {
    const error = new Error("Pick a date and time for the interview before sharing the link.");
    error.status = 400;
    throw error;
  }

  const existing = await getEnrollment(userId, businessTitle);
  blockIfLocked(existing);

  if (!existing?.examPassed) {
    const error = new Error("This learner hasn't passed the final exam yet - the interview can't be scheduled.");
    error.status = 400;
    throw error;
  }

  const enrollment = await BusinessEnrollment.upsert({
    where: { userId_businessTitle: { userId, businessTitle } },
    update: { meetLink, interviewScheduledAt: new Date(scheduledAt), interviewStatus: "SCHEDULED" },
    create: { userId, businessTitle, skill, meetLink, interviewScheduledAt: new Date(scheduledAt), interviewStatus: "SCHEDULED" },
  });

  notificationService.create(
    userId,
    `Your interview for ${businessTitle} has been scheduled.`,
    "/interview"
  ).catch(() => {});

  return enrollment;
}

const INTERVIEW_PASS_MARKS = 60; // out of 100

async function recordInterviewResult(userId, businessTitle, skill, { score, meetLink }) {
  await assertUserExists(userId);

  const existing = await getEnrollment(userId, businessTitle);
  blockIfLocked(existing);

  if (!existing?.examPassed) {
    const error = new Error("This learner hasn't passed the final exam yet.");
    error.status = 400;
    throw error;
  }

  if (existing.interviewStatus === "NOT_SCHEDULED") {
    const error = new Error("Schedule the interview first before recording a result.");
    error.status = 400;
    throw error;
  }

  // Once passed, the result is final - no further attempts get recorded.
  if (existing.interviewPassed) {
    const error = new Error("This learner already passed their interview - the result can't be changed.");
    error.status = 400;
    throw error;
  }

  if (existing.interviewAttempts >= MAX_INTERVIEW_ATTEMPTS) {
    const error = new Error("This learner has used both interview attempts.");
    error.status = 400;
    throw error;
  }

  // Marks are required, out of 100 - pass/fail is always decided by the
  // system from the score, never taken directly from the caller. This is
  // what previously let a "Passed" action go through with no marks entered.
  const numericScore = Number(score);
  if (score === undefined || score === null || score === "" || Number.isNaN(numericScore)) {
    const error = new Error("Enter the interview marks (out of 100) before saving the result.");
    error.status = 400;
    throw error;
  }
  if (numericScore < 0 || numericScore > 100) {
    const error = new Error("Interview marks must be between 0 and 100.");
    error.status = 400;
    throw error;
  }

  const passed = numericScore > INTERVIEW_PASS_MARKS;

  const updated = await BusinessEnrollment.update({
    where: { id: existing.id },
    data: {
      interviewScore: numericScore,
      interviewPassed: passed,
      interviewAttempts: existing.interviewAttempts + 1,
      interviewStatus: "COMPLETED",
      meetLink: meetLink || existing.meetLink,
    },
  });

  if (updated.examPassed && updated.interviewPassed) {
    return BusinessEnrollment.update({ where: { id: updated.id }, data: { status: "PENDING_APPROVAL" } });
  }

  // Failed the interview but still has an attempt left - re-open scheduling
  // so the mentor can share a fresh link for the next attempt.
  if (updated.interviewAttempts < MAX_INTERVIEW_ATTEMPTS) {
    return BusinessEnrollment.update({ where: { id: updated.id }, data: { interviewStatus: "NOT_SCHEDULED" } });
  }

  return updated;
}

// Admin reviews a mentor's recorded results and signs off - only then does
// the course count as officially completed (unlocks a certificate + a new
// course pick for the learner).
async function approveCompletion(enrollmentId) {
  return BusinessEnrollment.update({
    where: { id: enrollmentId },
    data: { resultsApproved: true, status: "COMPLETED" },
  });
}

async function listPendingApproval() {
  return BusinessEnrollment.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

module.exports = {
  getOrCreate, getEnrollment, listForUser, markResourcesCompleted,
  assignPaper, recordExamResult, scheduleInterview, recordInterviewResult,
  approveCompletion, listPendingApproval, blockIfLocked,
  MAX_INTERVIEW_ATTEMPTS, PASS_PERCENT,
};
