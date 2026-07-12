import { jwtDecode } from 'jwt-decode';

/** Matches the backend's `TokenPayload` (see apps/backend auth.service.ts). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  isAuthority: boolean;
}

/** Decodes a JWT without verifying it — verification always happens server-side. */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwtDecode<AccessTokenPayload>(token);
  } catch {
    return null;
  }
}
