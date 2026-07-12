import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { httpClient } from '@/services/http/client';
import { tokenStorage } from '@/services/token-storage';
import { useAuthStore } from '@/store/auth.store';

/** Lands after Google OAuth redirect; stores tokens then redirects to Explore on success. */
export function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError('Missing tokens in callback URL.');
      return;
    }

    tokenStorage.setTokens(accessToken, refreshToken);
    useAuthStore.getState().setFromToken(accessToken);

    httpClient
      .get('/auth/me')
      .then(() => navigate('/explore', { replace: true }))
      .catch(() => setError('Failed to fetch profile.'));
  }, [searchParams, navigate]);

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <p className="text-sm text-muted-foreground">Completing login…</p>
    </div>
  );
}
