const Business = require("../models/Business");

async function listBusinesses(skill) {
  return Business.findMany({
    where: skill ? { skill } : undefined,
    orderBy: { title: "asc" },
  });
}

async function getBusinessById(id) {
  return Business.findUnique({
    where: { id },
    include: { learningResource: true },
  });
}

async function recommendForSkills(skills = []) {
  if (!skills.length) return [];

  return Business.findMany({
    where: { skill: { in: skills } },
    orderBy: { title: "asc" },
  });
}

// --- Admin: manage courses (skill categories) and sub-courses (business ideas) ---
// A "course" is really just the `skill` grouping on BusinessIdea, and a
// "sub-course" is an individual BusinessIdea row under that skill. There is
// no separate Course table (yet) - this keeps things simple while giving
// the admin full CRUD over what learners will eventually see.
async function listAllBusinessesGrouped() {
  const all = await Business.findMany({ orderBy: [{ skill: "asc" }, { title: "asc" }] });
  const grouped = {};
  for (const b of all) {
    if (!grouped[b.skill]) grouped[b.skill] = [];
    grouped[b.skill].push(b);
  }
  return grouped;
}

async function createBusiness(data) {
  const existing = await Business.findUnique({ where: { title: data.title } });
  if (existing) {
    const error = new Error("A course with this title already exists.");
    error.status = 409;
    throw error;
  }
  return Business.create({
    data: {
      title: data.title,
      skill: data.skill,
      description: data.description || "",
      investment: data.investment || "",
      income: data.income || "",
      difficulty: data.difficulty || "",
      duration: data.duration || "",
      requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
      roadmapSteps: Array.isArray(data.roadmapSteps) ? data.roadmapSteps : [],
    },
  });
}

async function updateBusiness(id, data) {
  const business = await Business.findUnique({ where: { id } });
  if (!business) {
    const error = new Error("Course not found.");
    error.status = 404;
    throw error;
  }
  return Business.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.skill !== undefined ? { skill: data.skill } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.investment !== undefined ? { investment: data.investment } : {}),
      ...(data.income !== undefined ? { income: data.income } : {}),
      ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.requiredSkills !== undefined ? { requiredSkills: data.requiredSkills } : {}),
      ...(data.roadmapSteps !== undefined ? { roadmapSteps: data.roadmapSteps } : {}),
    },
  });
}

async function deleteBusiness(id) {
  const business = await Business.findUnique({ where: { id } });
  if (!business) {
    const error = new Error("Course not found.");
    error.status = 404;
    throw error;
  }
  await Business.delete({ where: { id } });
}

module.exports = {
  listBusinesses, getBusinessById, recommendForSkills,
  listAllBusinessesGrouped, createBusiness, updateBusiness, deleteBusiness,
};
