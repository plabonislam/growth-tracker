import { httpClient } from '@/services/http/client';

export interface CurrentUser {
  name: string;
  email: string;
}

export const currentUserService = {
  getCurrentUser: async (): Promise<CurrentUser> => {
    const { data } = await httpClient.get<CurrentUser>('/auth/me');
    return data;
  },
};
