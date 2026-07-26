function sendSuccess(res, { status = 200, message = "Success", data = null } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, { status = 500, message = "Something went wrong", errors = null } = {}) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { sendSuccess, sendError };
