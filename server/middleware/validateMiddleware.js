const { sendError } = require("../utils/response");
const { isValidEmail, isValidPassword, isNonEmptyString } = require("../utils/validators");

function validateRegister(req, res, next) {
  const { fullName, email, password, mobile } = req.body;
  const errors = [];

  if (!isNonEmptyString(fullName)) errors.push("Full name is required.");
  if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
  if (!isValidPassword(password)) errors.push("Password must be at least 8 characters, with a number and a special character.");
  if (mobile && !/^[0-9]{10}$/.test(mobile)) errors.push("Enter a valid 10-digit mobile number, or leave it blank.");

  if (errors.length > 0) {
    return sendError(res, { status: 400, message: errors[0], errors });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
  if (!isNonEmptyString(password)) errors.push("Password is required.");

  if (errors.length > 0) {
    return sendError(res, { status: 400, message: errors[0], errors });
  }

  next();
}

module.exports = { validateRegister, validateLogin };
