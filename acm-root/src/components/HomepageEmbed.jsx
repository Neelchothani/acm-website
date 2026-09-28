import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from './LoadingScreen.jsx';
import { useSimulatedProgress } from '../hooks/useSimulatedProgress.js';

const HOMEPAGE_URL = 'http://localhost:5173';

export default function HomepageEmbed({ onNavigate, visible, shouldReset }) {
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  // Real progress from ACM CITY 2's frame loader (0-100)
  const [realProgress, setRealProgress] = useState(0);
  const hasRealProgressRef = useRef(false);

  // Simulated progress as fallback while waiting for first real progress msg
  // ACM CITY 2 loads 840 frames (~674MB) — allow up to 60s
  const { progress: simProgress, complete: simComplete } = useSimulatedProgress(
    !iframeLoaded && !hasRealProgressRef.current,
    60000
  );

  // The actual progress to display: real if available, else simulated
  const displayProgress = hasRealProgressRef.current ? realProgress : simProgress;

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;

      // Real frame-loading progress from ACM CITY 2
      if (e.data.type === 'loadingProgress') {
        hasRealProgressRef.current = true;
        setRealProgress(e.data.progress);
        if (e.data.progress >= 100) {
          setTimeout(() => setShowOverlay(false), 500);
        }
      }

      if (e.data.type === 'cityReady') {
        hasRealProgressRef.current = true;
        setRealProgress(100);
        setTimeout(() => setShowOverlay(false), 400);
      }

      // Navigate to section
      if (e.data.type === 'navigate' && e.data.section) {
        onNavigate && onNavigate(e.data.section);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onNavigate]);

  // Reset when returning to homepage
  useEffect(() => {
    if (shouldReset && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'reset' }, '*');
    }
  }, [shouldReset]);

  // iframe HTML load — frames may still be loading after this
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    simComplete(); // stop simulated bar — real progress takes over
  };

  // Reset on visibility change
  useEffect(() => {
    if (visible) {
      setShowOverlay(true);
      // If already loaded from a previous visit, show directly
      if (realProgress >= 100) setShowOverlay(false);
    }
  }, [visible]);

  return (
    <>
      {/* Homepage iframe — always in DOM, preloads in background */}
      <iframe
        ref={iframeRef}
        src={HOMEPAGE_URL}
        title="ACM City Homepage"
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

      {/* Progress bar loading screen */}
      {visible && (
        <LoadingScreen
          label="ACM CITY"
          progress={displayProgress}
          visible={showOverlay}
        />
      )}
    </>
  );
}
