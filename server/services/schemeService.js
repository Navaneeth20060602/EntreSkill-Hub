const GovernmentScheme = require("../models/GovernmentScheme");

async function listSchemes() {
  return GovernmentScheme.findMany({ orderBy: { name: "asc" } });
}

module.exports = { listSchemes };
