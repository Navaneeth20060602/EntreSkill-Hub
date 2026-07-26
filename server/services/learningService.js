const LearningResource = require("../models/LearningResource");

async function getByBusinessId(businessId) {
  return LearningResource.findUnique({ where: { businessId } });
}

module.exports = { getByBusinessId };
