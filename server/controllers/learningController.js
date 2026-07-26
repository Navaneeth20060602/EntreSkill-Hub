const asyncHandler = require("express-async-handler");
const learningService = require("../services/learningService");
const { sendSuccess, sendError } = require("../utils/response");

const getLearningResource = asyncHandler(async (req, res) => {
  const resource = await learningService.getByBusinessId(req.params.businessId);

  if (!resource) {
    return sendError(res, { status: 404, message: "No learning resources found for this business yet." });
  }

  sendSuccess(res, { data: { resource } });
});

module.exports = { getLearningResource };
