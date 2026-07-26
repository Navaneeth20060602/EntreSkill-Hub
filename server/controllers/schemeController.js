const asyncHandler = require("express-async-handler");
const schemeService = require("../services/schemeService");
const { sendSuccess } = require("../utils/response");

const getSchemes = asyncHandler(async (req, res) => {
  const schemes = await schemeService.listSchemes();
  sendSuccess(res, { data: { schemes } });
});

module.exports = { getSchemes };
