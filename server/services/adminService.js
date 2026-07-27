const User = require("../models/User");
const Mentor = require("../models/Mentor");
const bcrypt = require("bcryptjs");
const mentorService = require("./mentorService");
const otpService = require("./otpService");
const emailService = require("./emailService");
const { sanitizeUser } = require("../utils/helpers");

async function listUsers() {
  const users = await User.findMany({
    include: { progress: true },
    orderBy: { createdAt: "desc" },
  });
  return users.map(sanitizeUser);
}

async function getStats() {
  const Certificate = require("./certificateService");
  const Mentor = require("../models/Mentor");
  const UserProgress = require("../models/UserProgress");

  const [
    totalUsers,
    mentors,
    feedback,
    activeLearners,
    certificates,
    mentorList,
  ] = await Promise.all([
    User.count({ where: { role: "USER" } }),
    User.count({ where: { role: "MENTOR" } }),
    mentorService.listAllFeedback(),
    UserProgress.count({ where: { selectedBusinessTitle: { not: null } } }),
    Certificate.listAll(),
    Mentor.findMany({ select: { rating: true } }),
  ]);

  const ratedMentors = mentorList.filter((m) => m.rating > 0);
  const avgMentorRating = ratedMentors.length
    ? Math.round(
        (ratedMentors.reduce((sum, m) => sum + m.rating, 0) /
          ratedMentors.length) *
          10,
      ) / 10
    : 0;

  return {
    totalUsers,
    totalMentors: mentors,
    totalFeedback: feedback.length,
    activeUsers: activeLearners,
    certificatesIssued: certificates.length,
    avgMentorRating,
  };
}

// Step 1: send an OTP to the email the admin entered for the mentor, so we
// confirm the mentor actually has access to that inbox before any login is
// created for them (prevents the admin fat-fingering/making up an email).
async function sendMentorLoginOtp(email) {
  const otp = await otpService.generateOtp(email);
  return otp;
}

// Step 2: creates (or resets) a login account for a mentor already in the
// mentor directory, only after the OTP for that email has been verified.
async function createMentorLogin(mentorId, { email, password, otp }) {
  const mentor = await Mentor.findUnique({ where: { id: mentorId } });
  if (!mentor) {
    const error = new Error("Mentor not found.");
    error.status = 404;
    throw error;
  }

  const result = otpService.verifyOtp(email, otp);
  if (!result.success) {
    const error = new Error(result.message);
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (mentor.userId) {
    // Already has a login - just reset the password (and email, if changed).
    const updatedUser = await User.update({
      where: { id: mentor.userId },
      data: { email, passwordHash },
    });
    return sanitizeUser(updatedUser);
  }

  const existingEmail = await User.findUnique({ where: { email } });
  if (existingEmail) {
    const error = new Error("An account with this email already exists.");
    error.status = 409;
    throw error;
  }

  const user = await User.create({
    data: {
      fullName: mentor.name,
      email,
      passwordHash,
      role: "MENTOR",
      mobileVerified: false,
    },
  });

  await Mentor.update({ where: { id: mentorId }, data: { userId: user.id } });

  return sanitizeUser(user);
}

module.exports = { listUsers, getStats, sendMentorLoginOtp, createMentorLogin };
