import api from "./api";

export async function fetchMentors(specialization) {
  const { data } = await api.get("/mentors", { params: specialization ? { specialization } : {} });
  return data.data.mentors;
}

export async function fetchMentorById(id) {
  const { data } = await api.get(`/mentors/${id}`);
  return data.data.mentor;
}

export async function fetchMyAssignedMentor() {
  const { data } = await api.get("/mentors/assigned/me");
  return data.data.mentor;
}

export async function fetchMyMentorProfile() {
  const { data } = await api.get("/mentors/me/profile");
  return data.data; // { mentor, feedbacks }
}

export async function fetchMyStudents() {
  const { data } = await api.get("/mentors/me/students");
  return data.data.students;
}

export async function updateMyMentorProfile(formData) {
  const { data } = await api.patch("/mentors/me/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.mentor;
}

export async function addMyResource(formData) {
  const { data } = await api.post("/mentors/me/resources", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.resource;
}

export async function updateMyResource(id, formData) {
  const { data } = await api.patch(`/mentors/me/resources/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.resource;
}

export async function deleteMyResource(id) {
  await api.delete(`/mentors/me/resources/${id}`);
}

export async function fetchResources(businessTitle) {
  const { data } = await api.get("/mentors/resources", { params: businessTitle ? { businessTitle } : {} });
  return data.data.resources;
}

export async function fetchPendingResources() {
  const { data } = await api.get("/mentors/resources/pending/all");
  return data.data.resources;
}

export async function approveResource(id) {
  const { data } = await api.post(`/mentors/resources/${id}/approve`);
  return data.data.resource;
}

export async function rejectResource(id, reason) {
  const { data } = await api.post(`/mentors/resources/${id}/reject`, { reason });
  return data.data.resource;
}

export async function rateResource(resourceId, rating) {
  const { data } = await api.post(`/mentors/resources/${resourceId}/rate`, { rating });
  return data.data;
}

export async function submitFeedback(mentorId, { message, rating }) {
  const { data } = await api.post(`/mentors/${mentorId}/feedback`, { message, rating });
  return data.data.feedback;
}

// Admin-only
export async function createMentor(formData) {
  const { data } = await api.post("/mentors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.mentor;
}

export async function updateMentor(id, formData) {
  const { data } = await api.patch(`/mentors/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.mentor;
}

export async function deleteMentor(id) {
  await api.delete(`/mentors/${id}`);
}
