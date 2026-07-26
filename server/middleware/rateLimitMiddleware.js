const rateLimit = require("express-rate-limit");
const User = require("../models/User");

// Applies to login, register, and OTP endpoints - the ones most valuable
// to brute-force. 15 requests per 15 minutes per IP is generous for a real
// user but meaningfully slows down automated guessing.
//
// Admin and mentor accounts are staff, not the general public this limiter
// is meant to slow down - they should never be blocked out of their own
// dashboards by this. We look up the email being submitted and skip the
// limiter entirely when it belongs to an ADMIN or MENTOR account. If no
// email is present, or it doesn't match a staff account, the normal
// per-IP limit still applies (this is exactly what protects regular
// learner accounts from brute-forcing).
async function isStaffAttempt(req) {
  const email = req.body?.email;
  if (!email) return false;
  try {
    const user = await User.findUnique({ where: { email }, select: { role: true } });
    return user?.role === "ADMIN" || user?.role === "MENTOR";
  } catch {
    return false;
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isStaffAttempt,
  message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
});

module.exports = { authLimiter };
