import api from "./api";

// Learner side
export async function fetchMyThreads() {
  const { data } = await api.get("/chat/threads");
  return data.data.threads;
}

export async function fetchMessagesWithMentor(mentorId) {
  const { data } = await api.get(`/chat/mentor/${mentorId}`);
  return data.data.messages;
}

export async function sendMessageToMentor(mentorId, message) {
  const { data } = await api.post(`/chat/mentor/${mentorId}`, { message });
  return data.data.message;
}

// Mentor side
export async function fetchMyThreadsAsMentor() {
  const { data } = await api.get("/chat/mentor-threads");
  return data.data.threads;
}

export async function fetchMessagesWithUser(userId) {
  const { data } = await api.get(`/chat/user/${userId}`);
  return data.data.messages;
}

export async function sendMessageToUser(userId, message) {
  const { data } = await api.post(`/chat/user/${userId}`, { message });
  return data.data.message;
}

// Admin side
export async function fetchMessagesWithMentorAsAdmin(mentorId) {
  const { data } = await api.get(`/chat/admin/mentor/${mentorId}`);
  return data.data.messages;
}

export async function sendMessageToMentorAsAdmin(mentorId, message) {
  const { data } = await api.post(`/chat/admin/mentor/${mentorId}`, { message });
  return data.data.message;
}
