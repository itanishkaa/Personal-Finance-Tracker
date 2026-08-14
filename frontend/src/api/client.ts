import axios, { AxiosError } from "axios";

const TOKEN_STORAGE_KEY = "fintrack_token";

// Relative base URL - Vite's dev proxy (see vite.config.ts) forwards /api
// to the FastAPI backend, and the same relative path works once both are
// served behind the same origin in production.
export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Extracts a human-readable message from a FastAPI error response,
 * whether it's a plain `{detail: string}` or field-level validation
 * errors `{detail: [{field, message}, ...]}`.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string | { field: string; message: string }[];
    }>;
    const detail = axiosError.response?.data?.detail;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => `${d.field}: ${d.message}`).join("; ");
    }
  }
  return fallback;
}
