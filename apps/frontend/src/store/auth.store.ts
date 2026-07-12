import { create } from 'zustand';

import { decodeAccessToken } from '@/lib/jwt';
import { tokenStorage } from '@/services/token-storage';

interface AuthRole {
  userId: string | null;
  email: string | null;
  isAuthority: boolean;
}

interface AuthStore extends AuthRole {
  setFromToken: (accessToken: string) => void;
  clear: () => void;
}

function decodeRole(accessToken: string | null): AuthRole {
  const payload = accessToken ? decodeAccessToken(accessToken) : null;
  return {
    userId: payload?.sub ?? null,
    email: payload?.email ?? null,
    isAuthority: payload?.isAuthority ?? false,
  };
}

/** Auth role derived from the JWT `accessToken` — hydrated from `localStorage` on load. */
export const useAuthStore = create<AuthStore>((set) => ({
  ...decodeRole(tokenStorage.getAccessToken()),
  setFromToken: (accessToken) => set(decodeRole(accessToken)),
  clear: () => set(decodeRole(null)),
}));
