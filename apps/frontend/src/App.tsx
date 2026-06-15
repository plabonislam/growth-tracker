import { useEffect, useState } from 'react';

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

// ─── pages ──────────────────────────────────────────────────────────────────
function LoginPage() {
  const error = new URLSearchParams(window.location.search).get('error');
  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1 style={styles.title}>DSI Club</h1>
        {error && (
          <p style={styles.error}>
            OAuth failed — only @dsinnovators.com accounts are allowed.
          </p>
        )}
        <a href={`${API}/auth/google`} style={styles.btn}>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

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
      <div style={styles.center}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  if (!profile)
    return (
      <div style={styles.center}>
        <p>Completing login…</p>
      </div>
    );

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 12 }}>Logged in</h2>
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl as string}
            alt="avatar"
            style={styles.avatar}
          />
        )}
        <p>
          <strong>{profile.name as string}</strong>
        </p>
        <p style={{ color: '#666', fontSize: 14 }}>{profile.email as string}</p>
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: profile.isAuthority ? '#15803d' : '#555',
          }}
        >
          {profile.isAuthority ? '✓ Authority' : 'Member'}
        </p>
        <button
          style={{
            ...styles.btn,
            marginTop: 20,
            background: '#dc2626',
            cursor: 'pointer',
          }}
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── app ─────────────────────────────────────────────────────────────────────
export default function App() {
  const path = useRoute();

  if (path === '/auth/callback') return <CallbackPage />;
  return <LoginPage />;
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = {
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '40px 48px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    minWidth: 320,
  } as React.CSSProperties,
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 28,
    color: '#0f172a',
  } as React.CSSProperties,
  btn: {
    display: 'inline-block',
    padding: '12px 28px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 15,
    border: 'none',
  } as React.CSSProperties,
  error: {
    color: '#dc2626',
    marginBottom: 16,
    fontSize: 14,
  } as React.CSSProperties,
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    marginBottom: 12,
  } as React.CSSProperties,
};
