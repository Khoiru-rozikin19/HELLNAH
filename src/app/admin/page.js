'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ACCESS DENIED');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Server error');
      setLoading(false);
    }
  }

  return (
    <div className="login-body">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="login-title">☠ ACCESS TERMINAL HELIX</h1>
          <p className="login-subtitle">Surveillance System Login</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label className="login-label">USERNAME</label>
            <input
              type="text"
              className="login-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="login-label">PASSWORD</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
}
