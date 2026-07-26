import { httpClient } from '@/services/http/client';

export interface CurrentUser {
  name: string;
  email: string;
  /**
   * What the caller runs. Coordinating a club or mentoring a topic lives in
   * join tables rather than on the account, so the JWT can't carry either —
   * only `isAuthority` rides along in the token.
   */
  roles: {
    isAuthority: boolean;
    isCoordinator: boolean;
    isMentor: boolean;
  };
}

export const currentUserService = {
  getCurrentUser: async (): Promise<CurrentUser> => {
    const { data } = await httpClient.get<CurrentUser>('/auth/me');
    return data;
  },
};
