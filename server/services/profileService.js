const UserProgress = require("../models/UserProgress");
const User = require("../models/User");
const Business = require("../models/Business");
const mentorService = require("./mentorService");

async function getProgress(userId) {
  let progress = await UserProgress.findUnique({
    where: { userId },
  });

  // Self-heal: accounts created before this table existed (or via seed)
  // won't have a progress row yet.
  if (!progress) {
    progress = await UserProgress.create({ data: { userId } });
  }

  return progress;
}

async function saveSkills(userId, { selectedSkills, primarySkill }) {
  const updated = await UserProgress.upsert({
    where: { userId },
    update: { selectedSkills, primarySkill },
    create: { userId, selectedSkills, primarySkill },
  });

  // Assign exactly one mentor per learner, the first time their primary
  // skill is set - picking whichever matching mentor currently has the
  // fewest students, so the load spreads out automatically. This never
  // touches which specific course/business the learner picks - that
  // remains entirely their own choice.
  if (primarySkill) {
    const user = await User.findUnique({ where: { id: userId } });
    if (!user.assignedMentorId) {
      const mentor = await mentorService.assignMentorForSkill(primarySkill);
      if (mentor) {
        await User.update({ where: { id: userId }, data: { assignedMentorId: mentor.id } });
      }
    }
  }

  return updated;
}

// The real business/course catalog lives in the frontend's static data, so
// we track the learner's chosen course by its title. Picking a *different*
// course than whatever was selected before resets roadmap progress, since
// that progress belonged to the old course.
const enrollmentService = require("./enrollmentService");

async function saveSelectedBusiness(userId, businessTitle, skill) {
  const existing = await UserProgress.findUnique({ where: { userId } });
  const isNewCourse = existing?.selectedBusinessTitle !== businessTitle;

  const progress = await UserProgress.upsert({
    where: { userId },
    update: {
      selectedBusinessTitle: businessTitle,
      ...(isNewCourse ? { completedSteps: [], resourcesCompleted: false } : {}),
    },
    create: { userId, selectedBusinessTitle: businessTitle },
  });

  // Create the enrollment record right away - this is what actually makes
  // "one course at a time" take effect (Business Ideas checks for an
  // active enrollment to decide whether to lock other courses).
  await enrollmentService.getOrCreate(userId, businessTitle, skill || existing?.primarySkill);

  return progress;
}

async function saveCompletedSteps(userId, completedSteps) {
  const updated = await UserProgress.upsert({
    where: { userId },
    update: { completedSteps },
    create: { userId, completedSteps },
  });

  await maybeAssignMentorOnCompletion(userId, updated);

  return updated;
}

async function saveResourcesCompleted(userId, resourcesCompleted) {
  const updated = await UserProgress.upsert({
    where: { userId },
    update: { resourcesCompleted },
    create: { userId, resourcesCompleted },
  });

  await maybeAssignMentorOnCompletion(userId, updated);

  return updated;
}

// Auto-assigns the least-loaded mentor for the learner's skill once they've
// finished BOTH the mentor's learning resources and their full roadmap for
// the course they're enrolled in. This is a fallback/authoritative trigger
// for learners who somehow don't already have a mentor by this point (e.g.
// no mentor existed for their skill yet when they first signed up).
async function maybeAssignMentorOnCompletion(userId, progress) {
  if (!progress?.resourcesCompleted || !progress?.selectedBusinessTitle) return;

  const user = await User.findUnique({ where: { id: userId } });
  if (!user || user.assignedMentorId) return;

  const business = await Business.findUnique({ where: { title: progress.selectedBusinessTitle } });
  const totalSteps = business?.roadmapSteps?.length || 0;
  const completedCount = progress.completedSteps?.length || 0;
  const roadmapComplete = totalSteps > 0 && completedCount >= totalSteps;

  if (!roadmapComplete) return;

  const skill = progress.primarySkill || business?.skill;
  if (!skill) return;

  const mentor = await mentorService.assignMentorForSkill(skill);
  if (mentor) {
    await User.update({ where: { id: userId }, data: { assignedMentorId: mentor.id } });
  }
}

async function toggleBookmark(userId, businessId) {
  const progress = await getProgress(userId);

  const isBookmarked = progress.bookmarkedBusinessIds.includes(businessId);

  const bookmarkedBusinessIds = isBookmarked
    ? progress.bookmarkedBusinessIds.filter((id) => id !== businessId)
    : [...progress.bookmarkedBusinessIds, businessId];

  return UserProgress.update({
    where: { userId },
    data: { bookmarkedBusinessIds },
  });
}

module.exports = {
  getProgress,
  saveSkills,
  saveSelectedBusiness,
  saveCompletedSteps,
  saveResourcesCompleted,
  toggleBookmark,
};
