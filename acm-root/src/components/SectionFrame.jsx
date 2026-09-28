import React, { useEffect, useRef, useState, useMemo } from 'react';
import LoadingScreen from './LoadingScreen.jsx';
import { useSimulatedProgress } from '../hooks/useSimulatedProgress.js';

const SECTION_URLS = {
  events:       'http://localhost:5174',
  editorial:    'http://localhost:5175',
  research:     'http://localhost:5176',
  headquarters: 'http://localhost:5177',
  connect:      'http://localhost:5178',
};

const SECTION_LABELS = {
  events:       'EVENTS BUILDING 07',
  editorial:    'EDITORIAL DIGITAL LIBRARY',
  research:     'RESEARCH BUILDING 06',
  headquarters: 'ACM HEADQUARTERS & OUR TEAM',
  connect:      'CONNECT SATELLITE HUB',
};

/**
 * SectionFrame
 * Renders the active section's iframe full-screen with a bottom-left floating back button.
 * Caches mounted iframes in the background after first visit for instant re-entry.
 * Shows an ACM percentage slider bar while a section loads.
 */
export default function SectionFrame({ section, visible, onBack }) {
  // Track which sections have been visited so we keep their iframes mounted
  const [mountedSections, setMountedSections] = useState({});
  const [loadedSections, setLoadedSections] = useState({});
  const iframeRefs = useRef({});

  // Active section's loading simulation (0% -> 92% until onLoad fires)
  const isCurrentSectionLoaded = section ? !!loadedSections[section] : true;
  const { progress: simProgress, complete: simComplete } = useSimulatedProgress(
    visible && !!section && !isCurrentSectionLoaded,
    3000
  );

  // Listen for back navigation postMessage from sub-apps
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'back') {
        onBack && onBack();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onBack]);

  // Mount the section iframe the first time it becomes active
  useEffect(() => {
    if (section && !mountedSections[section]) {
      setMountedSections((prev) => ({ ...prev, [section]: true }));
    }
  }, [section, mountedSections]);

  const handleIframeLoaded = (id) => {
    setLoadedSections((prev) => ({ ...prev, [id]: true }));
    if (section === id) {
      simComplete();
    }
  };

  // Floating back button placed strictly at BOTTOM-LEFT
  const backBtnStyle = {
    position: 'fixed',
    bottom: '2rem',
    left: '2rem',
    zIndex: 10001,
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'rgba(8, 14, 26, 0.88)',
    border: '1.5px solid rgba(0, 240, 255, 0.45)',
    color: '#ffffff',
    padding: '0.75rem 1.4rem',
    borderRadius: '9999px',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 240, 255, 0.25)',
    textTransform: 'uppercase',
    transition: 'all 0.22s ease-out',
    userSelect: 'none',
  };

  return (
    <>
      {/* Render all mounted section iframes (keep alive after first visit) */}
      {Object.keys(SECTION_URLS).map((id) => {
        if (!mountedSections[id]) return null;
        const isActive = section === id && visible;
        const isLoaded = loadedSections[id];

        return (
          <iframe
            key={id}
            ref={(el) => { if (el) iframeRefs.current[id] = el; }}
            src={SECTION_URLS[id]}
            title={`ACM ${SECTION_LABELS[id]}`}
            allow="autoplay"
            onLoad={() => handleIframeLoaded(id)}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              zIndex: isActive ? 2 : -1,
              visibility: isActive ? 'visible' : 'hidden',
              opacity: isActive && isLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: isActive ? 'auto' : 'none',
              background: '#060913',
            }}
          />
        );
      })}

      {/* Percentage slider bar loading overlay for the active section */}
      {visible && section && !isCurrentSectionLoaded && (
        <LoadingScreen
          label={SECTION_LABELS[section] || 'DEPARTMENT EXPANSION'}
          progress={simProgress}
          visible={true}
          statusText="Loading department interface..."
        />
      )}

      {/* Floating back button — BOTTOM LEFT over the iframe */}
      {visible && (
        <button
          style={backBtnStyle}
          onClick={() => onBack && onBack()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.boxShadow = '0 8px 35px rgba(0, 240, 255, 0.45)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(8, 14, 26, 0.88)';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.45)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 240, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ color: '#00f0ff', fontSize: '1.05rem', fontWeight: 'bold' }}>←</span>
          <span>RETURN TO CITY</span>
        </button>
      )}
    </>
  );
}
