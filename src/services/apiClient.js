import axios from "axios";
import { tokenStorage } from "@/utils/tokenStorage";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
export const apiClient = axios.create({ baseURL, timeout: 10000 });

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    if (error.response?.status === 401 && requestUrl.endsWith("/auth/me")) {
      window.dispatchEvent(new Event("hawk-ai:session-expired"));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = "요청을 처리하지 못했습니다.") {
  const detail = error.response?.data?.detail;
  return error.response?.data?.message ||
    (typeof detail === "string" ? detail : null) ||
    (Array.isArray(detail) ? detail[0]?.msg : null) ||
    (error.response ? fallback : "서버에 연결할 수 없습니다.");
}
