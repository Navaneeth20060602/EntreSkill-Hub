const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const otpService = require("./otpService");

const SALT_ROUNDS = 10;

// Used by the "Send OTP" step on registration, before actually sending the
// OTP, so the person finds out immediately if their email/mobile is already
// taken instead of only after verifying the OTP.
async function checkAvailability({ email, mobile }) {
  if (email) {
    const existingEmail = await User.findUnique({ where: { email } });
    if (existingEmail) {
      const error = new Error("An account with this email already exists.");
      error.status = 409;
      throw error;
    }
  }

  if (mobile) {
    const existingMobile = await User.findUnique({ where: { mobile } });
    if (existingMobile) {
      const error = new Error("An account with this mobile number already exists.");
      error.status = 409;
      throw error;
    }
  }
}

async function registerUser({ fullName, email, mobile, password }) {
  await checkAvailability({ email, mobile });

  if (!otpService.isMobileVerified(email)) {
    const error = new Error("Please verify your email with the OTP before registering.");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    data: { fullName, email, mobile, passwordHash, mobileVerified: !!mobile },
  });

  otpService.clearVerified(email);

  // Every new user gets an empty progress record so the rest of the app
  // can assume `user.progress` always exists once fetched with `include`.
  await require("../models/UserProgress").create({
    data: { userId: user.id },
  });

  const token = generateToken(user.id);
  return { user, token };
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

async function loginUser({ email, password }) {
  const user = await User.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
    const error = new Error(`Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`);
    error.status = 429;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

    await User.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });

    const error = new Error(
      shouldLock
        ? "Too many failed attempts. This account is locked for 15 minutes."
        : "Invalid email or password."
    );
    error.status = shouldLock ? 429 : 401;
    throw error;
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await User.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  const token = generateToken(user.id);
  return { user, token };
}

// Forgot-password flow: reuses the same mock OTP mechanism as mobile OTP,
// but keyed by email. In demo mode the OTP is returned to the caller since
// no real email provider is configured yet.
async function requestPasswordReset(email) {
  const user = await User.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("No account found with this email.");
    error.status = 404;
    throw error;
  }
  return otpService.generateOtp(email);
}

async function resetPassword({ email, otp, newPassword }) {
  const result = otpService.verifyOtp(email, otp);
  if (!result.success) {
    const error = new Error(result.message);
    error.status = 400;
    throw error;
  }

  const user = await User.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("No account found with this email.");
    error.status = 404;
    throw error;
  }

  const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
  if (isSameAsOld) {
    const error = new Error("New password cannot be the same as your current password. Please choose a different password.");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.update({ where: { email }, data: { passwordHash } });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findUnique({ where: { id: userId } });
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    const error = new Error("Current password is incorrect.");
    error.status = 400;
    throw error;
  }

  const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
  if (isSameAsOld) {
    const error = new Error("New password cannot be the same as your current password. Please choose a different password.");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.update({ where: { id: userId }, data: { passwordHash } });
}

// --- Google Sign-In ---
// Verifies the ID token Google's client-side script hands us, then finds or
// creates a matching account. Google-created accounts get a random,
// unusable password hash - they simply never use password login unless the
// person later sets one via "Forgot password".
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function loginWithGoogle(idToken) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("Google Sign-In isn't configured on this server yet.");
    error.status = 501;
    throw error;
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    const error = new Error("Could not verify your Google account. Please try again.");
    error.status = 401;
    throw error;
  }

  const { email, name } = payload;

  let user = await User.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = require("crypto").randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

    user = await User.create({
      data: { fullName: name || email.split("@")[0], email, passwordHash },
    });

    await require("../models/UserProgress").create({ data: { userId: user.id } });
  }

  const token = generateToken(user.id);
  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
  checkAvailability,
  requestPasswordReset,
  resetPassword,
  changePassword,
  loginWithGoogle,
};
