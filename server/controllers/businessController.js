const asyncHandler = require("express-async-handler");
const businessService = require("../services/businessService");
const { sendSuccess, sendError } = require("../utils/response");

const getBusinesses = asyncHandler(async (req, res) => {
  const { skill } = req.query;
  const businesses = await businessService.listBusinesses(skill);
  sendSuccess(res, { data: { businesses } });
});

const getBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.getBusinessById(req.params.id);

  if (!business) {
    return sendError(res, { status: 404, message: "Business idea not found." });
  }

  sendSuccess(res, { data: { business } });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const skills = Array.isArray(req.body.skills) ? req.body.skills : [];
  const businesses = await businessService.recommendForSkills(skills);
  sendSuccess(res, { data: { businesses } });
});

// --- Admin: manage courses & sub-courses ---
const adminListCourses = asyncHandler(async (req, res) => {
  const grouped = await businessService.listAllBusinessesGrouped();
  sendSuccess(res, { data: { courses: grouped } });
});

const adminCreateCourse = asyncHandler(async (req, res) => {
  const { title, skill } = req.body;
  if (!title || !skill) {
    return sendError(res, { status: 400, message: "Course (skill) name and sub-course title are required." });
  }
  try {
    const business = await businessService.createBusiness(req.body);
    sendSuccess(res, { status: 201, message: "Sub-course added.", data: { business } });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

const adminUpdateCourse = asyncHandler(async (req, res) => {
  try {
    const business = await businessService.updateBusiness(req.params.id, req.body);
    sendSuccess(res, { message: "Sub-course updated.", data: { business } });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

const adminDeleteCourse = asyncHandler(async (req, res) => {
  try {
    await businessService.deleteBusiness(req.params.id);
    sendSuccess(res, { message: "Sub-course removed." });
  } catch (err) {
    return sendError(res, { status: err.status || 400, message: err.message });
  }
});

module.exports = {
  getBusinesses, getBusiness, getRecommendations,
  adminListCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
};
