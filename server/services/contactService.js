const ContactMessage = require("../models/ContactMessage");
const emailService = require("./emailService");
const notificationService = require("./notificationService");

async function submitMessage(userId, { type, subject, message, rating }) {
  const created = await ContactMessage.create({
    data: { userId, type, subject, message, rating: rating ? Number(rating) : null },
  });

  // Feedback/suggestions get an automatic "thank you" email; complaints are
  // left for the admin to personally respond to.
  if (type === "FEEDBACK" || type === "SUGGESTION") {
    const user = await require("../models/User").findUnique({ where: { id: userId } });
    emailService.sendEmail({
      to: user.email,
      subject: "Thanks for your feedback - EntreSkill Hub",
      body: `Hi ${user.fullName},\n\nThank you for sharing your thoughts with us! We really appreciate you taking the time to help us improve.\n\n- Team EntreSkill Hub`,
    });
    await ContactMessage.update({ where: { id: created.id }, data: { autoEmailSent: true } });
  }

  return created;
}

// Maps the internal workflow status to what a learner should actually see.
// TRANSFERRED is purely an internal routing state (which staff/mentor is
// looking into it) - to the learner it just still reads as "Open".
function toLearnerStatus(status) {
  if (status === "TRANSFERRED") return "OPEN";
  return status;
}

async function listMyMessages(userId) {
  const messages = await ContactMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Only ever expose what the learner should see: their complaint, a
  // simplified status, and the admin's response - never who it was
  // transferred to internally or any other admin-side detail.
  return messages.map(({ id, type, subject, message, status, adminResponse, respondedAt, createdAt }) => ({
    id,
    type,
    subject,
    message,
    status: toLearnerStatus(status),
    adminResponse,
    respondedAt,
    createdAt,
  }));
}

async function listAll(type) {
  return ContactMessage.findMany({
    where: type ? { type } : undefined,
    include: {
      user: { select: { fullName: true, email: true } },
      transferredToMentor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function respond(id, adminResponse) {
  const updated = await ContactMessage.update({
    where: { id },
    data: { adminResponse, status: "RESPONDED", respondedAt: new Date() },
  });

  notificationService.create(
    updated.userId,
    `You have a response to your "${updated.subject}" ticket.`,
    "/contact"
  ).catch(() => {});

  return updated;
}

async function closeTicket(id) {
  return ContactMessage.update({ where: { id }, data: { status: "CLOSED" } });
}

async function transferToMentor(id) {
  const message = await ContactMessage.findUnique({
    where: { id },
    include: { user: { select: { assignedMentorId: true, fullName: true } } },
  });

  if (!message) {
    const error = new Error("Message not found.");
    error.status = 404;
    throw error;
  }

  if (!message.user.assignedMentorId) {
    const error = new Error(`${message.user.fullName} doesn't have a mentor assigned yet.`);
    error.status = 400;
    throw error;
  }

  return ContactMessage.update({
    where: { id },
    data: { transferredToMentorId: message.user.assignedMentorId, status: "TRANSFERRED" },
  });
}

// The mentor only ever sees the complaint's content - never who filed it -
// so the learner's identity stays known only to the admin.
async function listTransferredToMentor(mentorId) {
  const messages = await ContactMessage.findMany({
    where: { transferredToMentorId: mentorId, type: "COMPLAINT" },
    orderBy: { createdAt: "desc" },
  });

  return messages.map(({ id, subject, message, status, mentorNote, createdAt }) => ({
    id, subject, message, status, mentorNote, createdAt,
  }));
}

async function addMentorNote(id, mentorId, mentorNote) {
  const result = await ContactMessage.updateMany({
    where: { id, transferredToMentorId: mentorId },
    data: { mentorNote },
  });
  if (result.count === 0) return null;
  return ContactMessage.findUnique({ where: { id } });
}

module.exports = {
  submitMessage, listMyMessages, listAll, respond, closeTicket,
  transferToMentor, listTransferredToMentor, addMentorNote,
};
