'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditUsersPage() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' or 'error'
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setSaving(true);

    const res = await fetch('/api/admin/edit-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg(data.message || 'PASSWORD UPDATED SUCCESSFULLY');
      setMsgType('success');
      setPassword('');
    } else {
      setMsg(data.error || 'GAGAL UPDATE PASSWORD');
      setMsgType('error');
    }
    setSaving(false);
  }

  return (
    <div className="edit-body">
      <div className="edit-container">
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <div className="edit-header">
            <h1 className="helix-title">HELIX USER SECURITY</h1>
            <button onClick={() => router.push('/admin/dashboard')} className="btn-back">
              ← BACK DASHBOARD
            </button>
          </div>

          <div className="edit-panel">
            {msg && (
              <div className={msgType === 'success' ? 'msg-success' : 'msg-error'}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="edit-label">NEW PASSWORD</label>
                <input
                  type="password"
                  className="edit-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="edit-btn" disabled={saving}>
                {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
