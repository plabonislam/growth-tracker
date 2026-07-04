export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Stubbed current user. Swap for a real `httpClient.get('/auth/me')` call once
 * the auth session layer exists (see App.tsx CallbackPage / docs/frontend.md).
 */
const MOCK_USER: CurrentUser = {
  id: 'DSI-99238',
  name: 'Alex Johnson',
  email: 'alex.dev@university.edu',
};

export const currentUserService = {
  getCurrentUser: (): Promise<CurrentUser> => Promise.resolve(MOCK_USER),
};
