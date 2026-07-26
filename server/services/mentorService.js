const Mentor = require("../models/Mentor");
const MentorResource = require("../models/MentorResource");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const ResourceRating = require("../models/ResourceRating");
const notificationService = require("./notificationService");

async function listMentors(specialization) {
  return Mentor.findMany({
    where: specialization ? { specialization } : undefined,
    orderBy: { rating: "desc" },
  });
}

async function getMentorById(id) {
  return Mentor.findUnique({ where: { id }, include: { resources: true } });
}

async function getMentorByUserId(userId) {
  return Mentor.findUnique({ where: { userId }, include: { resources: true } });
}

// Admin no longer sets a mentor's rating directly - it's always the average
// of real learner feedback, starting at 0 with no reviews yet.
async function createMentor(data) {
  const { rating, ...rest } = data;
  return Mentor.create({ data: { ...rest, rating: 0 } });
}

async function updateMentor(id, data) {
  const { rating, ...rest } = data; // ignore any incoming rating - it's computed
  return Mentor.update({ where: { id }, data: rest });
}

async function deleteMentor(id) {
  return Mentor.delete({ where: { id } });
}

// Picks the least-loaded mentor for a specialization, so each learner is
// assigned to exactly one mentor and mentors get a roughly even spread of
// students (e.g. mentor with 2 students is picked over one with 3).
//
// Matching is case/whitespace-insensitive: mentor.specialization is admin-
// entered free text, and a stray space or casing difference (e.g. "cooking "
// vs "Cooking") used to make this query match zero mentors, silently
// skipping assignment. Trimming the input and using an insensitive match
// fixes that without changing the "least students wins" selection logic.
async function assignMentorForSkill(skill) {
  if (!skill) return null;
  const normalizedSkill = skill.trim();

  const mentors = await Mentor.findMany({
    where: { specialization: { equals: normalizedSkill, mode: "insensitive" } },
    include: { _count: { select: { assignedStudents: true } } },
  });

  if (mentors.length === 0) return null;

  mentors.sort((a, b) => a._count.assignedStudents - b._count.assignedStudents);
  return mentors[0];
}

async function getStudentsForMentor(mentorId) {
  return User.findMany({
    where: { assignedMentorId: mentorId },
    include: { progress: true, enrollments: true },
    orderBy: { createdAt: "desc" },
  });
}

async function addResource(mentorId, { title, url, noteText, description, businessTitle, contentType }) {
  return MentorResource.create({
    data: { mentorId, title, url, noteText, description, businessTitle, contentType: contentType || "video", approved: false },
  });
}

async function updateResource(id, mentorId, data) {
  // Editing a resource sends it back for re-approval, since the content
  // changed - and if it had been rejected, this is the mentor's fix, so
  // clear the rejection flag/reason and let it re-enter the normal
  // pending queue.
  const result = await MentorResource.updateMany({
    where: { id, mentorId },
    data: { ...data, approved: false, rejected: false, rejectionReason: null },
  });
  if (result.count === 0) return null;
  return MentorResource.findUnique({ where: { id } });
}

// Learners only ever see admin-approved resources.
async function listResources(businessTitle) {
  const resources = await MentorResource.findMany({
    where: { approved: true, ...(businessTitle ? { businessTitle } : {}) },
    include: {
      mentor: { select: { id: true, name: true, photo: true } },
      ratings: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return resources.map((r) => {
    const avg = r.ratings.length
      ? r.ratings.reduce((sum, x) => sum + x.rating, 0) / r.ratings.length
      : 0;
    const { ratings, ...rest } = r;
    return { ...rest, averageRating: Math.round(avg * 10) / 10, ratingCount: ratings.length };
  });
}

async function listPendingResources() {
  return MentorResource.findMany({
    where: { approved: false, rejected: false },
    include: { mentor: { select: { name: true, specialization: true } } },
    orderBy: { createdAt: "asc" },
  });
}

async function approveResource(id) {
  const resource = await MentorResource.update({
    where: { id },
    data: { approved: true, rejected: false, rejectionReason: null },
  });

  const mentor = await Mentor.findUnique({ where: { id: resource.mentorId } });
  if (mentor?.userId) {
    notificationService.create(
      mentor.userId,
      `Your resource "${resource.title}" was approved and is now live for learners.`,
      "/mentor-dashboard"
    ).catch(() => {});
  }

  return resource;
}

// Admin rejects a mentor's submitted resource with a required reason. It
// stays unapproved (so learners never see it) but is also flagged as
// rejected so it drops out of the admin's "pending" queue until the
// mentor actually does something about it - editing the resource (which
// already resets approved:false for re-review) also clears this flag so a
// fixed reupload goes back into the normal pending queue.
async function rejectResource(id, reason) {
  const resource = await MentorResource.update({
    where: { id },
    data: { approved: false, rejected: true, rejectionReason: reason },
  });

  const mentor = await Mentor.findUnique({ where: { id: resource.mentorId } });
  if (mentor?.userId) {
    notificationService.create(
      mentor.userId,
      `Your resource "${resource.title}" was rejected: ${reason}`,
      "/mentor-dashboard"
    ).catch(() => {});
  }

  return resource;
}

async function deleteResource(id, mentorId) {
  return MentorResource.deleteMany({ where: { id, mentorId } });
}

async function rateResource(resourceId, userId, rating) {
  await ResourceRating.upsert({
    where: { resourceId_userId: { resourceId, userId } },
    update: { rating },
    create: { resourceId, userId, rating },
  });

  // Return the real aggregate computed from the DB (one rating per user,
  // thanks to the upsert above) rather than having the caller guess at a
  // running average - that guessing is what previously double-counted a
  // changed rating as if it were a brand new one.
  const allRatings = await ResourceRating.findMany({ where: { resourceId } });
  const averageRating = allRatings.length
    ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 10) / 10
    : 0;

  return { averageRating, ratingCount: allRatings.length, myRating: rating };
}

async function addFeedback(userId, { mentorId, message, rating }) {
  const created = await Feedback.create({ data: { userId, mentorId, message, rating } });
  if (mentorId) await recomputeMentorRating(mentorId);
  return created;
}

async function recomputeMentorRating(mentorId) {
  const feedbacks = await Feedback.findMany({ where: { mentorId } });
  const avg = feedbacks.length
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
    : 0;
  return Mentor.update({ where: { id: mentorId }, data: { rating: Math.round(avg * 10) / 10 } });
}

async function listAllFeedback() {
  return Feedback.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      mentor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Feedback shown to a mentor is anonymous - the learner's identity is never
// sent to the mentor, only the rating and message.
async function listFeedbackForMentor(mentorId) {
  const feedbacks = await Feedback.findMany({
    where: { mentorId },
    orderBy: { createdAt: "desc" },
  });
  return feedbacks.map(({ id, message, rating, createdAt }) => ({ id, message, rating, createdAt }));
}

module.exports = {
  listMentors,
  getMentorById,
  getMentorByUserId,
  createMentor,
  updateMentor,
  deleteMentor,
  assignMentorForSkill,
  getStudentsForMentor,
  addResource,
  updateResource,
  listResources,
  listPendingResources,
  approveResource,
  rejectResource,
  deleteResource,
  rateResource,
  addFeedback,
  recomputeMentorRating,
  listAllFeedback,
  listFeedbackForMentor,
};
