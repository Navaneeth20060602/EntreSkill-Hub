import api from "./api";

export async function registerRequest({ fullName, email, mobile, password }) {
  const { data } = await api.post("/auth/register", { fullName, email, mobile, password });
  return data.data.user;
}

export async function sendOtpRequest(mobile, email) {
  const { data } = await api.post("/auth/send-otp", { mobile, email });
  return data.data; // { demoOtp } in dev mode
}

export async function verifyOtpRequest(email, otp) {
  await api.post("/auth/verify-otp", { email, otp });
  return true;
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data.user;
}

export async function googleLoginRequest(idToken) {
  const { data } = await api.post("/auth/google", { idToken });
  return data.data.user;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.data.user;
}

export async function forgotPasswordRequest(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data.data; // { demoOtp } in dev mode
}

export async function resetPasswordRequest({ email, otp, newPassword }) {
  await api.post("/auth/reset-password", { email, otp, newPassword });
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}
