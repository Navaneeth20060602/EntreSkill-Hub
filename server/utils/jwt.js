const jwt = require("jsonwebtoken");
const { TOKEN_EXPIRY } = require("./constants");

function generateToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in the environment");
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
