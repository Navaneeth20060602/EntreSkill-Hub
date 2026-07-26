const Business = require("../models/Business");
const UserProgress = require("../models/UserProgress");

async function getRoadmap(businessId) {
  const business = await Business.findUnique({
    where: { id: businessId },
    select: { id: true, title: true, roadmapSteps: true },
  });

  return business;
}

async function getProgressForUser(userId, businessId) {
  const progress = await UserProgress.findUnique({ where: { userId } });

  if (!progress || progress.selectedBusinessId !== businessId) {
    return [];
  }

  return progress.completedSteps;
}

async function saveProgressForUser(userId, businessId, completedSteps) {
  return UserProgress.upsert({
    where: { userId },
    update: { selectedBusinessId: businessId, completedSteps },
    create: { userId, selectedBusinessId: businessId, completedSteps },
  });
}

module.exports = { getRoadmap, getProgressForUser, saveProgressForUser };
