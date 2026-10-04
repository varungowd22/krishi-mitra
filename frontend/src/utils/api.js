import axios from "axios";

const configuredApiHost = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const apiOrigin = configuredApiHost
  ? (/^https?:\/\//i.test(configuredApiHost) ? configuredApiHost : `https://${configuredApiHost}`)
  : "";

const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("km_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 503 &&
      /database-backed user account/i.test(err.response?.data?.message || "")
    ) {
      err.response.data.message = "Saved data is temporarily unavailable. Please try again later.";
    }
    if (err.response?.data?.code === "DATABASE_UNAVAILABLE") {
      err.response.data.message = "Unable to complete this action right now. Please try again later.";
    }
    if (err.response?.status === 401) {
      localStorage.removeItem("km_token");
      localStorage.removeItem("km_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
