import type { CreateSession, SessionResponse } from 'shared';

import { httpClient } from '@/services/http/client';

/**
 * The club's session log — `POST /clubs/:clubId/sessions`. Whoever runs the
 * club writes it: its mentors, its coordinator, and an authority. Reading the
 * log belongs to the dashboard, which reports a whole month at once.
 */
export const sessionsService = {
  logSession: ({
    clubId,
    session,
  }: {
    clubId: string;
    session: CreateSession;
  }): Promise<SessionResponse> =>
    httpClient
      .post<SessionResponse>(`/clubs/${clubId}/sessions`, session)
      .then((r) => r.data),
};
