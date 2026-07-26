const Business = require("../models/Business");
const { parseInvestmentRange } = require("../utils/helpers");

// A simple, transparent estimate - not financial advice. It just turns the
// investment range already shown on a business card into a rough monthly
// savings plan, which is enough for the "Cost estimation" roadmap step in
// the PRD without pretending to be a real financial model.
async function estimateForBusiness(businessId, monthsToSave = 6) {
  const business = await Business.findUnique({ where: { id: businessId } });

  if (!business) {
    const error = new Error("Business idea not found.");
    error.status = 404;
    throw error;
  }

  const { min, max } = parseInvestmentRange(business.investment);
  const average = Math.round((min + max) / 2);
  const safeMonths = Math.max(1, Number(monthsToSave) || 6);

  return {
    businessTitle: business.title,
    minInvestment: min,
    maxInvestment: max,
    averageInvestment: average,
    monthsToSave: safeMonths,
    suggestedMonthlySavings: Math.round(average / safeMonths),
  };
}

module.exports = { estimateForBusiness };
