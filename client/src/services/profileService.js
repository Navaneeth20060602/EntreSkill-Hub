import api from "./api";

export async function saveSkillsRequest({ selectedSkills, primarySkill }) {
  const { data } = await api.put("/profile/skills", { selectedSkills, primarySkill });
  return data.data.progress;
}

export async function fetchProfile() {
  const { data } = await api.get("/profile");
  return data.data.progress;
}

export async function saveSelectedBusinessRequest(businessTitle, skill) {
  const { data } = await api.put("/profile/business", { businessTitle, skill });
  return data.data.progress;
}

export async function saveCompletedStepsRequest(completedSteps) {
  const { data } = await api.put("/profile/progress", { completedSteps });
  return data.data.progress;
}

export async function saveResourcesCompletedRequest(resourcesCompleted) {
  const { data } = await api.put("/profile/resources-completed", { resourcesCompleted });
  return data.data.progress;
}

export async function toggleBookmarkRequest(businessId) {
  const { data } = await api.post(`/profile/bookmark/${businessId}`);
  return data.data.progress;
}

export async function updateMyDetails(formData) {
  const { data } = await api.patch("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.user;
}
