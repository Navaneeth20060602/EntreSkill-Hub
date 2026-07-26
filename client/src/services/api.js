import axios from "axios";

// Talks to the EntreSkill Hub API. withCredentials lets the browser send
// the httpOnly auth cookie set by the backend on login/register.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Static files (like mentor photos) are served from the server root, not
// under /api, so strip the trailing /api to build absolute file URLs.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default api;
