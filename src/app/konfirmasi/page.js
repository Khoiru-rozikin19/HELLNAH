'use client';

import { useEffect, useState } from 'react';

export default function KonfirmasiPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="konfirmasi-body">
      <div className="konfirmasi-card">
        <h1 className="konfirmasi-title">Halaman Akan Dialihkan</h1>
        <p className="konfirmasi-text">Anda akan diarahkan ke halaman utama dalam</p>
        <span className="konfirmasi-timer">{countdown}</span>
        <p className="konfirmasi-sub">detik...</p>
      </div>
    </div>
  );
}
