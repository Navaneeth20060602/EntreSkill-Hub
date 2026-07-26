const { sendError } = require("../utils/response");

function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// Centralized error handler. Any controller that does `next(error)`
// (or throws inside an async handler wrapped with express-async-handler)
// ends up here instead of crashing the server.
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  // Prisma unique-constraint violation
  if (err.code === "P2002") {
    status = 409;
    message = `A record with this ${err.meta?.target?.join(", ") || "value"} already exists.`;
  }

  // Prisma "record not found"
  if (err.code === "P2025") {
    status = 404;
    message = "The requested record was not found.";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  return sendError(res, {
    status,
    message,
    errors: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = { notFound, errorHandler };
