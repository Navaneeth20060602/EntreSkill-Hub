import api from "./api";

export async function submitContactMessage({ type, subject, message, rating }) {
  const { data } = await api.post("/contact", { type, subject, message, rating });
  return data.data.contactMessage;
}

export async function fetchMyMessages() {
  const { data } = await api.get("/contact/mine");
  return data.data.messages;
}

// Admin
export async function fetchAllMessages(type) {
  const { data } = await api.get("/contact", { params: type ? { type } : {} });
  return data.data.messages;
}

export async function respondToMessage(id, response) {
  const { data } = await api.patch(`/contact/${id}/respond`, { response });
  return data.data.contactMessage;
}

export async function transferMessageToMentor(id) {
  const { data } = await api.patch(`/contact/${id}/transfer`);
  return data.data.contactMessage;
}

export async function closeTicket(id) {
  const { data } = await api.patch(`/contact/${id}/close`);
  return data.data.contactMessage;
}

// Mentor side
export async function fetchMyAssignedComplaints() {
  const { data } = await api.get("/contact/assigned/mine");
  return data.data.messages;
}

export async function addMentorNoteToComplaint(id, note) {
  const { data } = await api.patch(`/contact/${id}/mentor-note`, { note });
  return data.data.contactMessage;
}
