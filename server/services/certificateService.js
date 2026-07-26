const Certificate = require("../models/Certificate");
const enrollmentService = require("./enrollmentService");
const notificationService = require("./notificationService");

async function issueCertificate({ userId, businessTitle, fileUrl, issuedByMentorId }) {
  const enrollment = await enrollmentService.getEnrollment(userId, businessTitle);

  if (!enrollment?.examPassed || !enrollment?.interviewPassed) {
    const error = new Error("This learner hasn't passed both the exam and the interview for this course yet.");
    error.status = 400;
    throw error;
  }

  // An admin must explicitly approve the mentor-recorded results first -
  // issuing a certificate is not itself an approval action.
  if (!enrollment.resultsApproved) {
    const error = new Error("This learner's results haven't been approved yet - approve them before issuing a certificate.");
    error.status = 400;
    throw error;
  }

  const existingCertificate = await Certificate.findUnique({ where: { userId_businessTitle: { userId, businessTitle } } });
  if (existingCertificate) {
    const error = new Error("A certificate has already been issued for this learner and course - it can't be reissued.");
    error.status = 400;
    throw error;
  }

  const certificate = await Certificate.create({ data: { userId, businessTitle, fileUrl, issuedByMentorId } });

  notificationService.create(
    userId,
    `Your certificate for ${businessTitle} has been issued! 🏆`,
    "/certificate"
  ).catch(() => {});

  return certificate;
}

async function listForUser(userId) {
  return Certificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" } });
}

async function listAll() {
  return Certificate.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

module.exports = { issueCertificate, listForUser, listAll };
