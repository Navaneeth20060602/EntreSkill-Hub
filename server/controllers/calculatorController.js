const asyncHandler = require("express-async-handler");
const calculatorService = require("../services/calculatorService");
const { sendSuccess } = require("../utils/response");

const estimate = asyncHandler(async (req, res) => {
  const { businessId, monthsToSave } = req.body;
  const result = await calculatorService.estimateForBusiness(businessId, monthsToSave);
  sendSuccess(res, { data: { estimate: result } });
});

module.exports = { estimate };
