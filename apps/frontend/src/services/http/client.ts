import axios from 'axios';

import { API_URL } from '@/app/config/env';

/** Global Axios client. Injects the stored access token; see `pages/auth/callback-page.tsx`. */
export const httpClient = axios.create({
  baseURL: API_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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
