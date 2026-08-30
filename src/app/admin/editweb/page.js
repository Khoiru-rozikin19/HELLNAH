'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditWebPage() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [files, setFiles] = useState({});
  const [deleteFlags, setDeleteFlags] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/editweb')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null; }
        return r.json();
      })
      .then(d => {
        if (d) setProfil(d.profil);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  function update(field, value) {
    setProfil(prev => ({ ...prev, [field]: value }));
  }

  function handleFile(field, file) {
    setFiles(prev => ({ ...prev, [field]: file }));
  }

  function toggleDelete(field) {
    setDeleteFlags(prev => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setSaving(true);

    const formData = new FormData();

    // Text fields
    const textFields = [
      'site_title', 'meta_description',
      'og_type', 'og_title', 'og_description', 'og_url', 'og_site_name', 'og_locale',
      'og_image_width', 'og_image_height', 'og_image_alt',
      'twitter_card', 'twitter_title', 'twitter_description',
      'theme_color', 'apple_webapp_capable', 'apple_webapp_statusbar',
    ];

    for (const f of textFields) {
      formData.append(f, profil?.[f] || '');
    }

    // File uploads
    const uploadFields = ['favicon', 'apple_touch_icon', 'og_image', 'twitter_image'];
    for (const f of uploadFields) {
      if (deleteFlags[f]) {
        formData.append(`hapus_${f}`, 'true');
      } else if (files[f]) {
        formData.append(f, files[f]);
      }
    }

    try {
      const res = await fetch('/api/admin/editweb', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(data.message || 'PROFIL WEB BERHASIL DIUPDATE');
        setMsgType('success');
      } else {
        setMsg(data.error || 'GAGAL SIMPAN');
        setMsgType('error');
      }
    } catch {
      setMsg('Network error');
      setMsgType('error');
    }

    setSaving(false);
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

  return (
    <div className="edit-body">
      <div className="edit-container">
        <div className="edit-inner">
          <div className="edit-header">
            <h1 className="helix-title">HELIX WEB PROFILE</h1>
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
              {/* BASIC META */}
              <div className="section-title">■ BASIC META</div>
              <div className="edit-grid">
                <div className="full-width">
                  <label className="edit-label">SITE TITLE</label>
                  <input className="edit-input" value={profil?.site_title || ''} onChange={e => update('site_title', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">META DESCRIPTION</label>
                  <textarea className="edit-input" rows={3} value={profil?.meta_description || ''} onChange={e => update('meta_description', e.target.value)} />
                </div>

                <div>
                  <label className="edit-label">FAVICON</label>
                  <input type="file" className="edit-input" accept="image/*" onChange={e => handleFile('favicon', e.target.files[0])} />
                  <div className="file-current">
                    CURRENT: {profil?.favicon || '-'}
                    {profil?.favicon && (
                      <label className="delete-check">
                        <input type="checkbox" checked={!!deleteFlags.favicon} onChange={() => toggleDelete('favicon')} /> hapus
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="edit-label">APPLE TOUCH ICON</label>
                  <input type="file" className="edit-input" accept="image/*" onChange={e => handleFile('apple_touch_icon', e.target.files[0])} />
                  <div className="file-current">
                    CURRENT: {profil?.apple_touch_icon || '-'}
                    {profil?.apple_touch_icon && (
                      <label className="delete-check">
                        <input type="checkbox" checked={!!deleteFlags.apple_touch_icon} onChange={() => toggleDelete('apple_touch_icon')} /> hapus
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="edit-label">THEME COLOR</label>
                  <input type="color" className="edit-input" style={{ height: '3rem' }} value={profil?.theme_color || '#0B1F5F'} onChange={e => update('theme_color', e.target.value)} />
                </div>

                <div>
                  <label className="edit-label">APPLE WEBAPP CAPABLE</label>
                  <select className="edit-select" value={profil?.apple_webapp_capable || 'yes'} onChange={e => update('apple_webapp_capable', e.target.value)}>
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>

                <div className="full-width">
                  <label className="edit-label">APPLE WEBAPP STATUSBAR STYLE</label>
                  <select className="edit-select" value={profil?.apple_webapp_statusbar || 'default'} onChange={e => update('apple_webapp_statusbar', e.target.value)}>
                    <option value="default">default</option>
                    <option value="black">black</option>
                    <option value="black-translucent">black-translucent</option>
                  </select>
                </div>
              </div>

              {/* OPEN GRAPH */}
              <div className="section-title">■ OPEN GRAPH (SOCIAL SHARE)</div>
              <div className="edit-grid">
                <div>
                  <label className="edit-label">OG TYPE</label>
                  <select className="edit-select" value={profil?.og_type || 'website'} onChange={e => update('og_type', e.target.value)}>
                    {['website', 'article', 'profile', 'product'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="edit-label">OG LOCALE</label>
                  <input className="edit-input" placeholder="id_ID" value={profil?.og_locale || ''} onChange={e => update('og_locale', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG TITLE</label>
                  <input className="edit-input" value={profil?.og_title || ''} onChange={e => update('og_title', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG DESCRIPTION</label>
                  <textarea className="edit-input" rows={3} value={profil?.og_description || ''} onChange={e => update('og_description', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG URL</label>
                  <input className="edit-input" placeholder="https://..." value={profil?.og_url || ''} onChange={e => update('og_url', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG SITE NAME</label>
                  <input className="edit-input" value={profil?.og_site_name || ''} onChange={e => update('og_site_name', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG IMAGE</label>
                  <input type="file" className="edit-input" accept="image/*" onChange={e => handleFile('og_image', e.target.files[0])} />
                  <div className="file-current">
                    CURRENT: {profil?.og_image || '-'}
                    {profil?.og_image && (
                      <label className="delete-check">
                        <input type="checkbox" checked={!!deleteFlags.og_image} onChange={() => toggleDelete('og_image')} /> hapus
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="edit-label">OG IMAGE WIDTH</label>
                  <input className="edit-input" placeholder="1200" value={profil?.og_image_width || ''} onChange={e => update('og_image_width', e.target.value)} />
                </div>

                <div>
                  <label className="edit-label">OG IMAGE HEIGHT</label>
                  <input className="edit-input" placeholder="630" value={profil?.og_image_height || ''} onChange={e => update('og_image_height', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">OG IMAGE ALT</label>
                  <input className="edit-input" value={profil?.og_image_alt || ''} onChange={e => update('og_image_alt', e.target.value)} />
                </div>
              </div>

              {/* TWITTER CARD */}
              <div className="section-title">■ TWITTER CARD</div>
              <div className="edit-grid">
                <div className="full-width">
                  <label className="edit-label">TWITTER CARD TYPE</label>
                  <select className="edit-select" value={profil?.twitter_card || 'summary_large_image'} onChange={e => update('twitter_card', e.target.value)}>
                    {['summary_large_image', 'summary', 'player'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="full-width">
                  <label className="edit-label">TWITTER TITLE</label>
                  <input className="edit-input" value={profil?.twitter_title || ''} onChange={e => update('twitter_title', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">TWITTER DESCRIPTION</label>
                  <textarea className="edit-input" rows={3} value={profil?.twitter_description || ''} onChange={e => update('twitter_description', e.target.value)} />
                </div>

                <div className="full-width">
                  <label className="edit-label">TWITTER IMAGE</label>
                  <input type="file" className="edit-input" accept="image/*" onChange={e => handleFile('twitter_image', e.target.files[0])} />
                  <div className="file-current">
                    CURRENT: {profil?.twitter_image || '-'}
                    {profil?.twitter_image && (
                      <label className="delete-check">
                        <input type="checkbox" checked={!!deleteFlags.twitter_image} onChange={() => toggleDelete('twitter_image')} /> hapus
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="edit-btn" disabled={saving}>
                {saving ? 'SAVING...' : 'SAVE WEB PROFILE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
