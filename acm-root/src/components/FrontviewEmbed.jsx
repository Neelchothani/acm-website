import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from './LoadingScreen.jsx';
import { useSimulatedProgress } from '../hooks/useSimulatedProgress.js';

const FRONTVIEW_URL = 'http://localhost:8080';

export default function FrontviewEmbed({ onComplete, visible }) {
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // Simulated progress — frontview loads quickly (React + Three.js bundle, ~2-3s)
  const { progress, complete } = useSimulatedProgress(!iframeLoaded, 3000);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'frontviewComplete') {
        onComplete && onComplete();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onComplete]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    complete();
    // Hide overlay after 100% shows briefly
    setTimeout(() => setShowOverlay(false), 600);
  };

  useEffect(() => {
    if (visible) {
      setIframeLoaded(false);
      setShowOverlay(true);
    }
  }, [visible]);

  return (
    <>
      {/* Frontview iframe — always in DOM so it starts loading immediately */}
      <iframe
        ref={iframeRef}
        src={FRONTVIEW_URL}
        title="ACM Frontview"
        allow="autoplay"
        onLoad={handleIframeLoad}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: visible ? 1 : -1,
          visibility: visible ? 'visible' : 'hidden',
          opacity: visible && !showOverlay ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: visible && !showOverlay ? 'auto' : 'none',
        }}
      />

      {/* Loading screen with progress bar */}
      {visible && (
        <LoadingScreen
          label="FRONTVIEW"
          progress={progress}
          visible={showOverlay}
        />
      )}
    </>
  );
}
