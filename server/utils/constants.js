const COOKIE_NAME = "eshub_token";

const TOKEN_EXPIRY = "7d";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const ROLES = {
  USER: "USER",
  MENTOR: "MENTOR",
  ADMIN: "ADMIN",
};

const MESSAGES = {
  SERVER_ERROR: "Something went wrong. Please try again.",
  NOT_FOUND: "The requested resource was not found.",
  UNAUTHORIZED: "Please log in to continue.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_IN_USE: "An account with this email already exists.",
};

module.exports = { COOKIE_NAME, TOKEN_EXPIRY, TOKEN_EXPIRY_MS, ROLES, MESSAGES };
