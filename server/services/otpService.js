const { sendEmail } = require("./emailService");

const otpStore = new Map();
const verifiedStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000;
const VERIFIED_TTL_MS = 15 * 60 * 1000;

async function generateOtp(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));

  otpStore.set(email, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  try {
    await sendEmail({
      to: email,
      subject: "EntreSkill Hub - Email Verification OTP",
      body: `Your OTP is ${code}. It is valid for 5 minutes.`,
    });
  } catch (err) {
    console.error(
      "Could not send OTP email (continuing anyway, demo OTP still works):",
      err.message,
    );
  }

  return code;
}

function verifyOtp(email, code) {
  const entry = otpStore.get(email);

  if (!entry) {
    return {
      success: false,
      message: "No OTP was requested for this email.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);

    return {
      success: false,
      message: "OTP has expired. Please request a new one.",
    };
  }

  if (entry.code !== String(code)) {
    return {
      success: false,
      message: "Incorrect OTP.",
    };
  }

  otpStore.delete(email);

  verifiedStore.set(email, Date.now() + VERIFIED_TTL_MS);

  return {
    success: true,
  };
}

function isVerified(email) {
  const expiresAt = verifiedStore.get(email);

  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    verifiedStore.delete(email);
    return false;
  }

  return true;
}

function clearVerified(email) {
  verifiedStore.delete(email);
}

module.exports = {
  generateOtp,
  verifyOtp,
  isVerified,
  clearVerified,
};
