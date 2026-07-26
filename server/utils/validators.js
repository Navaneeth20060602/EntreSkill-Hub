const validator = require("validator");

function isValidEmail(email) {
  return typeof email === "string" && validator.isEmail(email);
}

// At least 8 characters, one number, and one special character.
function isValidPassword(password) {
  if (typeof password !== "string" || password.length < 8) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) return false;
  return true;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

module.exports = { isValidEmail, isValidPassword, isNonEmptyString };
