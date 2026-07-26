const asyncHandler = require("express-async-handler");
const roadmapService = require("../services/roadmapService");
const { sendSuccess, sendError } = require("../utils/response");

const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.getRoadmap(req.params.businessId);

  if (!roadmap) {
    return sendError(res, { status: 404, message: "Roadmap not found." });
  }

  sendSuccess(res, { data: { roadmap } });
});

const getMyProgress = asyncHandler(async (req, res) => {
  const completedSteps = await roadmapService.getProgressForUser(req.user.id, req.params.businessId);
  sendSuccess(res, { data: { completedSteps } });
});

const saveMyProgress = asyncHandler(async (req, res) => {
  const { completedSteps } = req.body;
  const progress = await roadmapService.saveProgressForUser(req.user.id, req.params.businessId, completedSteps || []);
  sendSuccess(res, { message: "Progress saved.", data: { progress } });
});

module.exports = { getRoadmap, getMyProgress, saveMyProgress };
