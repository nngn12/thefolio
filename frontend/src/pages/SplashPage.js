// src/pages/SplashPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SplashPage() {
  const [dots, setDots]           = useState('');
  const [isFadingOut, setFading]  = useState(false);
  const [progress, setProgress]   = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1.5));
    }, 45);

    const fadeTimer    = setTimeout(() => setFading(true),          3000);
    const redirectTimer = setTimeout(() => navigate('/home'),        3500);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="splash-wrapper">
      <div className={`loader-card ${isFadingOut ? 'fade-out' : ''}`}>
        <img src="/index.png" alt="TheFolio" className="logo" />
        <h1>The Art of Web Development</h1>

        <div className="loader-row">
          <div className="circular-loader" />
          <div className="linear-loader-container">
            <div className="linear-loader-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="loading-text">
          Loading<span>{dots}</span>
        </div>
      </div>
    </div>
  );
}

export default SplashPage;
