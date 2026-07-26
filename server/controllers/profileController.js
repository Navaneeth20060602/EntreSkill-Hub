const asyncHandler = require("express-async-handler");
const profileService = require("../services/profileService");
const { sendSuccess, sendError } = require("../utils/response");

const getProfile = asyncHandler(async (req, res) => {
  const progress = await profileService.getProgress(req.user.id);
  sendSuccess(res, { data: { progress } });
});

const updateSkills = asyncHandler(async (req, res) => {
  const { selectedSkills, primarySkill } = req.body;
  const progress = await profileService.saveSkills(req.user.id, { selectedSkills, primarySkill });
  sendSuccess(res, { message: "Skills saved.", data: { progress } });
});

const updateSelectedBusiness = asyncHandler(async (req, res) => {
  const { businessTitle, skill } = req.body;
  if (!businessTitle) return sendError(res, { status: 400, message: "businessTitle is required." });
  const progress = await profileService.saveSelectedBusiness(req.user.id, businessTitle, skill);
  sendSuccess(res, { message: "Business selection saved.", data: { progress } });
});

const updateProgressSteps = asyncHandler(async (req, res) => {
  const { completedSteps } = req.body;
  const progress = await profileService.saveCompletedSteps(req.user.id, completedSteps || []);
  sendSuccess(res, { message: "Progress saved.", data: { progress } });
});

const updateResourcesCompleted = asyncHandler(async (req, res) => {
  const { resourcesCompleted } = req.body;
  const progress = await profileService.saveResourcesCompleted(req.user.id, !!resourcesCompleted);
  sendSuccess(res, { message: "Progress saved.", data: { progress } });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const progress = await profileService.toggleBookmark(req.user.id, businessId);
  sendSuccess(res, { message: "Bookmark updated.", data: { progress } });
});

module.exports = {
  getProfile,
  updateSkills,
  updateSelectedBusiness,
  updateProgressSteps,
  updateResourcesCompleted,
  toggleBookmark,
};
