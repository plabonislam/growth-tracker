import type { UserResponse } from 'shared';

import { httpClient } from '@/services/http/client';

export const usersService = {
  getUsers: (): Promise<UserResponse[]> =>
    httpClient.get<UserResponse[]>('/users').then((r) => r.data),
};
