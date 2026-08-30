'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditTransferPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/edit-transfer')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null; }
        return r.json();
      })
      .then(d => {
        if (d) setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/admin/edit-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      alert('Gagal menyimpan');
      setSaving(false);
    }
  }

  function update(field, value) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="edit-body">
        <div className="edit-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'title', label: 'Title' },
    { name: 'subtitle', label: 'Subtitle' },
    { name: 'amount_idr', label: 'Amount IDR' },
    { name: 'amount_myr', label: 'Amount MYR' },
    { name: 'sender_bank', label: 'Sender Bank' },
    { name: 'sender_name', label: 'Sender Name' },
    { name: 'sender_account', label: 'Sender Account' },
    { name: 'receiver_bank', label: 'Receiver Bank' },
    { name: 'receiver_account', label: 'Receiver Account' },
    { name: 'receiver_name', label: 'Receiver Name' },
  ];

  return (
    <div className="edit-body">
      <div className="edit-container">
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div className="edit-header">
            <h1 className="helix-title">HELIX CONTROL PANEL</h1>
            <button onClick={() => router.push('/admin/dashboard')} className="btn-back">
              ← BACK DASHBOARD
            </button>
          </div>

          <div className="edit-panel">
            <form onSubmit={handleSubmit}>
              <div className="edit-grid">
                {fields.map(f => (
                  <div key={f.name}>
                    <label className="edit-label">{f.label}</label>
                    <input
                      className="edit-input"
                      value={data?.[f.name] || ''}
                      onChange={e => update(f.name, e.target.value)}
                    />
                  </div>
                ))}

                <div className="full-width" style={{ paddingTop: '0.75rem' }}>
                  <button type="submit" className="edit-btn" disabled={saving}>
                    {saving ? 'SAVING...' : 'SAVE CONFIGURATION'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
