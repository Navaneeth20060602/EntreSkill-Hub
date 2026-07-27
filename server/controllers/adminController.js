const asyncHandler = require("express-async-handler");
const adminService = require("../services/adminService");
const mentorService = require("../services/mentorService");
const { sendSuccess, sendError } = require("../utils/response");
const { isValidPassword } = require("../utils/validators");

const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  sendSuccess(res, { data: { users } });
});

const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await mentorService.listAllFeedback();
  sendSuccess(res, { data: { feedback } });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  sendSuccess(res, { data: stats });
});

const sendMentorLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, {
      status: 400,
      message: "Enter a valid email address.",
    });
  }

  const otp = await adminService.sendMentorLoginOtp(email);
  const isDemoOtpMode = process.env.SMS_PROVIDER !== "live";

  sendSuccess(res, {
    message: "OTP sent to the mentor's email.",
    data: isDemoOtpMode ? { demoOtp: otp } : undefined,
  });
});

const createMentorLogin = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !isValidPassword(password) || !otp) {
    return sendError(res, {
      status: 400,
      message:
        "Email, a valid password (8+ characters, with a number and special character), and the OTP are required.",
    });
  }

  const user = await adminService.createMentorLogin(req.params.mentorId, {
    email,
    password,
    otp,
  });
  sendSuccess(res, {
    status: 201,
    message: "Mentor login created.",
    data: { user },
  });
});

module.exports = {
  getUsers,
  getFeedback,
  getStats,
  sendMentorLoginOtp,
  createMentorLogin,
};
