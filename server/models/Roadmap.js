// There is no standalone "Roadmap" table - each business idea owns its
// roadmap as a simple ordered list of steps (BusinessIdea.roadmapSteps).
// This wrapper keeps the model exposed under the name used by
// roadmapService/roadmapController, and step-completion state per user
// lives on UserProgress.completedSteps.
const prisma = require("../config/prisma");

module.exports = prisma.businessIdea;
