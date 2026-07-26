const asyncHandler = require("express-async-handler");
const authService = require("../services/authService");
const otpService = require("../services/otpService");
const { sendSuccess, sendError } = require("../utils/response");
const { sanitizeUser } = require("../utils/helpers");
const { COOKIE_NAME, TOKEN_EXPIRY_MS } = require("../utils/constants");
const { isValidPassword } = require("../utils/validators");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendOtp = asyncHandler(async (req, res) => {
  const { mobile, email } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return sendError(res, {
      status: 400,
      message: "Enter a valid email address.",
    });
  }

  if (mobile && !/^[0-9]{10}$/.test(mobile)) {
    return sendError(res, {
      status: 400,
      message: "Enter a valid 10-digit mobile number.",
    });
  }

  // Check for an existing account BEFORE sending the OTP, not after -
  // otherwise someone verifies an OTP only to be told at the very end that
  // the account already exists.
  try {
    await authService.checkAvailability({ email, mobile });
  } catch (err) {
    return sendError(res, { status: err.status || 409, message: err.message });
  }

  await otpService.generateOtp(email);

  sendSuccess(res, {
    message: "OTP sent to your email.",
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = otpService.verifyOtp(email, otp);

  if (!result.success) {
    return sendError(res, { status: 400, message: result.message });
  }

  sendSuccess(res, { message: "Email verified successfully." });
});

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: TOKEN_EXPIRY_MS,
  });
}

const register = asyncHandler(async (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  if (!EMAIL_REGEX.test(email)) {
    return sendError(res, {
      status: 400,
      message: "Enter a valid email address.",
    });
  }

  const { user, token } = await authService.registerUser({
    fullName,
    email,
    mobile,
    password,
  });

  setAuthCookie(res, token);

  sendSuccess(res, {
    status: 201,
    message: "Account created successfully.",
    data: { user: sanitizeUser(user), token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser({ email, password });

  setAuthCookie(res, token);

  sendSuccess(res, {
    message: "Logged in successfully.",
    data: { user: sanitizeUser(user), token },
  });
});

const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  sendSuccess(res, { message: "Logged out successfully." });
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: sanitizeUser(req.user) } });
});

// --- Forgot password (email OTP, mock mode) ---
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return sendError(res, {
      status: 400,
      message: "Enter a valid email address.",
    });
  }

  try {
    await authService.requestPasswordReset(email);

    sendSuccess(res, {
      message: "OTP sent to your email.",
    });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || !isValidPassword(newPassword)) {
    return sendError(res, {
      status: 400,
      message:
        "New password must be at least 8 characters, with a number and a special character.",
    });
  }

  try {
    await authService.resetPassword({ email, otp, newPassword });
    sendSuccess(res, {
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

// --- Change password (logged in, from dashboard) ---
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || !isValidPassword(newPassword)) {
    return sendError(res, {
      status: 400,
      message:
        "New password must be at least 8 characters, with a number and a special character.",
    });
  }

  try {
    await authService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });
    sendSuccess(res, { message: "Password changed successfully." });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken)
    return sendError(res, {
      status: 400,
      message: "Missing Google credential.",
    });

  try {
    const { user, token } = await authService.loginWithGoogle(idToken);
    setAuthCookie(res, token);
    sendSuccess(res, {
      message: "Logged in with Google.",
      data: { user: sanitizeUser(user), token },
    });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin,
};
