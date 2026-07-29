import axios from 'axios';

import { tokenStorage } from '@/services/token-storage';

/** Global Axios client. Injects the stored access token; see `pages/auth/callback-page.tsx`. */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Best-effort message extraction from a NestJS error response. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] };
    const message = data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

/**
 * The stable `code` a NestJS error carries, when it has one. Screens branch on
 * this rather than on the message, which is prose and free to be reworded.
 */
export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: unknown };
    if (typeof data?.code === 'string') return data.code;
  }
  return null;
}

/** True for a 409 response — e.g. a uniqueness conflict caught server-side. */
export function isConflictError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}
