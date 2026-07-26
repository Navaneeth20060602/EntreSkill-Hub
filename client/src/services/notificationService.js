import api from "./api";

export async function fetchMyNotifications() {
  const { data } = await api.get("/notifications/mine");
  return data.data; // { notifications, unread }
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch("/notifications/read-all");
  return data;
}
