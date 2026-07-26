import api from "./api";

// Mentor - papers
export async function createPaper({ businessTitle, title }) {
  const { data } = await api.post("/exams/papers", { businessTitle, title });
  return data.data.paper;
}

export async function fetchMyPapers(businessTitle) {
  const { data } = await api.get("/exams/papers/mine", { params: businessTitle ? { businessTitle } : {} });
  return data.data.papers;
}

export async function deletePaper(id) {
  await api.delete(`/exams/papers/${id}`);
}

export async function assignPaperToStudent({ userId, businessTitle, skill, paperId }) {
  const { data } = await api.post("/exams/papers/assign", { userId, businessTitle, skill, paperId });
  return data.data.enrollment;
}

// Mentor - questions
export async function addQuestion({ businessTitle, paperId, question, options, correctIndex }) {
  const { data } = await api.post("/exams/questions", { businessTitle, paperId, question, options, correctIndex });
  return data.data.question;
}

export async function deleteQuestion(id) {
  await api.delete(`/exams/questions/${id}`);
}

export async function fetchMyQuestions(businessTitle) {
  const { data } = await api.get("/exams/questions/mine", { params: businessTitle ? { businessTitle } : {} });
  return data.data.questions;
}

// Mentor - interview scheduling/results
export async function scheduleInterview({ userId, businessTitle, skill, meetLink, scheduledAt }) {
  const { data } = await api.post("/exams/interview-schedule", { userId, businessTitle, skill, meetLink, scheduledAt });
  return data.data.enrollment;
}

export async function recordInterviewResult({ userId, businessTitle, skill, score, meetLink }) {
  const { data } = await api.post("/exams/interview-result", { userId, businessTitle, skill, score, meetLink });
  return data.data.enrollment;
}

// Learner
export async function fetchExamQuestions(businessTitle) {
  const { data } = await api.get(`/exams/questions/${encodeURIComponent(businessTitle)}`);
  return data.data.questions;
}

export async function submitExam({ businessTitle, skill, answers }) {
  const { data } = await api.post("/exams/submit", { businessTitle, skill, answers });
  return data.data;
}

export async function fetchMyEnrollments() {
  const { data } = await api.get("/exams/enrollments");
  return data.data.enrollments;
}

export async function markResourcesDone({ businessTitle, skill }) {
  const { data } = await api.post("/exams/resources-done", { businessTitle, skill });
  return data.data.enrollment;
}

// Admin
export async function fetchPendingApprovals() {
  const { data } = await api.get("/exams/pending-approvals");
  return data.data.enrollments;
}

export async function approveCompletion(enrollmentId) {
  const { data } = await api.post(`/exams/pending-approvals/${enrollmentId}/approve`);
  return data.data.enrollment;
}

export async function fetchEnrollmentsForUser(userId) {
  const { data } = await api.get(`/exams/enrollments/user/${userId}`);
  return data.data.enrollments;
}
