const { verifyToken } = require("../utils/jwt");
const { COOKIE_NAME, MESSAGES } = require("../utils/constants");
const { sendError } = require("../utils/response");
const prisma = require("../config/prisma");

// Reads the JWT from the httpOnly cookie (or an Authorization header as a
// fallback for API tools like Postman) and attaches the user to req.user.
async function protect(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = req.cookies?.[COOKIE_NAME] || bearer;

    if (!token) {
      return sendError(res, { status: 401, message: MESSAGES.UNAUTHORIZED });
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return sendError(res, { status: 401, message: MESSAGES.UNAUTHORIZED });
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, { status: 401, message: MESSAGES.UNAUTHORIZED });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, { status: 403, message: "You do not have permission to do this." });
    }
    next();
  };
}

module.exports = { protect, requireRole };
