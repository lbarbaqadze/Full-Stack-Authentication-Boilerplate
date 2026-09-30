import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const skipRefresh = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/verify-email",
  "/api/auth/refresh-token",
  "/api/auth/logout",
  "/api/auth/forgot-password",
];

let onSessionExpired: (() => void) | null = null;
let refreshPromise: Promise<void> | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data) return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  return "something went wrong";
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const path = original?.url ?? "";
    const shouldSkip = skipRefresh.some((route) => path.includes(route));

    if (!original || error.response?.status !== 401 || original._retry || shouldSkip) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= api
        .post("/api/auth/refresh-token")
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });

      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  }
);