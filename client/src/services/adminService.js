import api from "./api";

export async function fetchAllUsers() {
  const { data } = await api.get("/admin/users");
  return data.data.users;
}

export async function fetchAllFeedback() {
  const { data } = await api.get("/admin/feedback");
  return data.data.feedback;
}

export async function fetchStats() {
  const { data } = await api.get("/admin/stats");
  return data.data;
}

export async function createMentorLogin(mentorId, { email, password, otp }) {
  const { data } = await api.post(`/admin/mentors/${mentorId}/create-login`, { email, password, otp });
  return data.data.user;
}

export async function sendMentorLoginOtp(email) {
  const { data } = await api.post("/admin/mentors/send-login-otp", { email });
  return data.data; // { demoOtp } in dev mode
}

// Courses & sub-courses management. A "course" is a skill category
// (e.g. "Cooking") and a "sub-course" is an individual business idea
// listed under it (e.g. "Home Bakery Business").
export async function fetchAllCourses() {
  const { data } = await api.get("/business/admin/courses");
  return data.data.courses; // { [skill]: [subCourse, ...] }
}

export async function createSubCourse(payload) {
  const { data } = await api.post("/business/admin/courses", payload);
  return data.data.business;
}

export async function updateSubCourse(id, payload) {
  const { data } = await api.patch(`/business/admin/courses/${id}`, payload);
  return data.data.business;
}

export async function deleteSubCourse(id) {
  await api.delete(`/business/admin/courses/${id}`);
}
