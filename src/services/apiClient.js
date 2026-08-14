import axios from "axios";
import { tokenStorage } from "@/utils/tokenStorage";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
export const apiClient = axios.create({ baseURL, timeout: 10000, withCredentials: true });
const refreshClient = axios.create({ baseURL, timeout: 10000, withCredentials: true });
let refreshPromise = null;

function requestTokenRefresh() {
  refreshPromise ||= refreshClient.post("/auth/refresh")
    .then(({ data }) => {
      tokenStorage.set(data.accessToken);
      window.dispatchEvent(new CustomEvent("hawk-ai:token-refreshed", { detail: data }));
      return data;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function isExpiredSession(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthOperation = ["/auth/login", "/auth/refresh", "/auth/logout"].some((path) => requestUrl.endsWith(path));
    if (error.response?.status === 401 && !error.config?._retriedAfterRefresh && !isAuthOperation) {
      try {
        const { accessToken: token } = await requestTokenRefresh();
        error.config._retriedAfterRefresh = true;
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // A temporary timeout or network interruption must not sign the user
        // out. Only an explicit authentication rejection ends the session.
        if (isExpiredSession(refreshError)) {
          tokenStorage.remove();
          window.dispatchEvent(new Event("hawk-ai:session-expired"));
        }
      }
    }
    return Promise.reject(error);
  },
);

export const refreshAccessToken = () => requestTokenRefresh();
export const isSessionExpiredError = isExpiredSession;

export function getApiErrorMessage(error, fallback = "요청을 처리하지 못했습니다.") {
  const detail = error.response?.data?.detail;
  return error.response?.data?.message ||
    (typeof detail === "string" ? detail : null) ||
    (Array.isArray(detail) ? detail[0]?.msg : null) ||
    (error.response ? fallback : "서버에 연결할 수 없습니다.");
}
