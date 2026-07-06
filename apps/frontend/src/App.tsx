import { useEffect, useState } from 'react';

import { ClubDetailPage } from '@/pages/clubs/club-detail-page';

import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { ExplorePage } from '@/pages/explore/explore-page';
import { EnrolledTopicPage } from '@/pages/topics/enrolled-topic-page';
import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/pages/login/login-page';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ─── tiny client-side router ────────────────────────────────────────────────
function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return path;
}

// ─── auth callback ──────────────────────────────────────────────────────────
function CallbackPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError('Missing tokens in callback URL.');
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setError('Failed to fetch profile.'));
  }, []);

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );

  if (!profile)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <p className="text-sm text-muted-foreground">Completing login…</p>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Logged in</h2>
        {typeof profile.avatarUrl === 'string' && (
          <img
            src={profile.avatarUrl}
            alt="avatar"
            className="mx-auto mb-3 size-16 rounded-full"
          />
        )}
        <p className="font-semibold">{profile.name as string}</p>
        <p className="text-sm text-muted-foreground">
          {profile.email as string}
        </p>
      </div>
    </div>
  );
}

// ─── app ─────────────────────────────────────────────────────────────────────
export default function App() {
  const path = useRoute();

  if (path === '/auth/callback') return <CallbackPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/explore') return <ExplorePage />;
  if (path === '/dashboard') return <DashboardPage />;
  const topicMatch = path.match(/^\/topics\/([^/]+)$/);
  if (topicMatch) return <EnrolledTopicPage topicId={topicMatch[1]} />;
  const clubMatch = path.match(/^\/clubs\/([^/]+)$/);
  if (clubMatch) return <ClubDetailPage clubId={clubMatch[1]} />;
  return <LandingPage />;
}
