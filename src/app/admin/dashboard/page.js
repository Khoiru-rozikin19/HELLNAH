'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function HudCorners() {
  return (
    <>
      <span className="hud-corner tl"></span>
      <span className="hud-corner tr"></span>
      <span className="hud-corner bl"></span>
      <span className="hud-corner br"></span>
    </>
  );
}

export default function DashboardPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState('--:--:--');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => {
        if (r.status === 401) {
          router.push('/admin');
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (data) setRecords(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Live clock
    function tick() {
      const d = new Date();
      setClock(d.toLocaleTimeString('id-ID', { hour12: false }));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  }

  function formatTime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' WIB';
  }

  function getMapEmbed(lat, lon) {
    const delta = 0.004;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
  }

  function getMapsLink(lat, lon) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
  }

  return (
    <div className="dashboard-body">
      <div className="page">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="brand-mark">⌬</div>
            <div>
              <h1 className="brand-title">
                HELIX<span className="brand-accent">_GEOLOCATION</span>
              </h1>
              <div className="brand-sub">Sistem Monitoring</div>
            </div>
          </div>

          <div className="topbar-status">
            <div className="status-pill">
              <span className="status-dot"></span>
            </div>
            <div className="status-clock">{clock}</div>

            <button onClick={() => router.push('/admin/edit_transfer')} className="btn-nav">
              EDIT TRANSFER
            </button>
            <button onClick={() => router.push('/admin/edit_users')} className="btn-nav">
              EDIT USER
            </button>
            <button onClick={() => router.push('/admin/editweb')} className="btn-nav">
              EDIT WEB
            </button>
            <button onClick={handleLogout} className="btn-nav">
              LOGOUT
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="empty-state">⚠ TIDAK ADA DATA DITEMUKAN.</div>
        )}

        {records.map((record) => (
          <div key={record.id || record.timestamp} className="record hud-frame">
            <HudCorners />

            <div className="record-head">
              <div className="record-id">
                <span className="label">RECORD ID</span>
                <span className="value">#{record.timestamp}</span>
              </div>
              <div className="record-time">
                <span className="label">WAKTU</span>
                <span className="value">{formatTime(record.created_at)}</span>
              </div>
            </div>

            {/* Photo */}
            {record.foto_url && (
              <div className="record-photos">
                <div className="photo-frame hud-frame">
                  <HudCorners />
                  <img src={record.foto_url} loading="lazy" alt="Foto capture" />
                  <div className="scan-line"></div>
                </div>
              </div>
            )}

            {/* Location */}
            {record.lat && record.lng ? (
              <div className="record-location">
                <div className="map-frame hud-frame">
                  <HudCorners />
                  <iframe
                    src={getMapEmbed(record.lat, record.lng)}
                    loading="lazy"
                    title={`Map ${record.timestamp}`}
                  />
                  <div className="map-crosshair"></div>
                </div>
                <div className="coord-readout">
                  <div className="coord-row">
                    <span className="label">LAT</span>
                    <span className="value">{Number(record.lat).toFixed(6)}</span>
                  </div>
                  <div className="coord-row">
                    <span className="label">LON</span>
                    <span className="value">{Number(record.lng).toFixed(6)}</span>
                  </div>
                  {record.accuracy && (
                    <div className="coord-row">
                      <span className="label">ACCURACY</span>
                      <span className="value">{record.accuracy} m</span>
                    </div>
                  )}
                  <a
                    href={getMapsLink(record.lat, record.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-maps"
                  >
                    BUKA DI GOOGLE MAPS ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="alert-missing">⚠ DATA LOKASI TIDAK TERSEDIA</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
