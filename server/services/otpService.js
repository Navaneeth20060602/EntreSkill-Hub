// Mock OTP service.
// No real SMS provider is configured, so OTPs are generated and verified
// in-memory and also returned in the API response (dev/demo mode) so the
// flow can be fully tested end to end. To go live later, replace the
// `sendNotification()` stub with a real email provider call (SendGrid/SES/etc.) and
// stop returning `otp` in the controller response.

const otpStore = new Map(); // key (email/mobile) -> { code, expiresAt }
const verifiedStore = new Map(); // key (email/mobile) -> expiresAt

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const VERIFIED_TTL_MS = 15 * 60 * 1000; // verified flag valid for 15 min (covers filling the rest of the form)

function generateOtp(key) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(key, { code, expiresAt: Date.now() + OTP_TTL_MS });
  sendNotification(key, code);
  return code;
}

// Stub for a real SMS provider integration.
function sendNotification(key, code) {
  console.log(`[MOCK OTP] Code for ${key}: ${code}`);
}

function verifyOtp(mobile, code) {
  const entry = otpStore.get(mobile);

  if (!entry) return { success: false, message: "No OTP was requested for this number." };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(mobile);
    return { success: false, message: "OTP has expired. Please request a new one." };
  }
  if (entry.code !== String(code)) {
    return { success: false, message: "Incorrect OTP." };
  }

  otpStore.delete(mobile);
  verifiedStore.set(mobile, Date.now() + VERIFIED_TTL_MS);
  return { success: true };
}

function isMobileVerified(mobile) {
  const expiresAt = verifiedStore.get(mobile);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    verifiedStore.delete(mobile);
    return false;
  }
  return true;
}

function clearVerified(mobile) {
  verifiedStore.delete(mobile);
}

module.exports = { generateOtp, verifyOtp, isMobileVerified, clearVerified };
