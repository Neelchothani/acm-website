import React from 'react';

/**
 * LoadingScreen
 * A sleek cyber-styled loading overlay with an interactive percentage slider bar.
 *
 * Props:
 *   label    {string}  — e.g. "ACM CITY", "FRONTVIEW", "EVENTS", "EDITORIAL"
 *   progress {number}  — 0 to 100
 *   visible  {boolean} — whether to show this overlay
 *   statusText {string} — optional subtext
 */
export default function LoadingScreen({
  label = 'SYSTEM INITIALIZATION',
  progress = 0,
  visible = true,
  statusText = 'Streaming computational assets...'
}) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #0a1122 0%, #03060c 80%, #000000 100%)',
    zIndex: visible ? 9999 : -1,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'all' : 'none',
    transition: 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Space Grotesk', 'JetBrains Mono', -apple-system, sans-serif",
    userSelect: 'none',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pulse-glow-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes scanline-anim {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Cyber Panel Card */}
      <div style={{
        position: 'relative',
        width: 'min(420px, 88vw)',
        padding: '2.5rem 2rem 2rem',
        borderRadius: '16px',
        background: 'rgba(10, 16, 28, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.12)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        {/* Top Glow Orb */}
        <div style={{
          position: 'relative',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#00f0ff',
          boxShadow: '0 0 20px #00f0ff, 0 0 40px rgba(0, 240, 255, 0.6)',
          animation: 'pulse-glow-ring 1.8s ease-in-out infinite',
        }} />

        {/* Heading & Category */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.22em',
            color: '#00f0ff',
            marginBottom: '0.35rem',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            ACM DJSCE
          </div>
          <h2 style={{
            fontSize: '1.35rem',
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '0.08em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {label}
          </h2>
          <p style={{
            fontSize: '0.78rem',
            color: '#8fa0bd',
            marginTop: '0.35rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
          }}>
            {clampedProgress < 100 ? statusText : 'Stream initialized successfully'}
          </p>
        </div>

        {/* Percentage Slider Bar Track */}
        <div style={{
          width: '100%',
          marginTop: '0.4rem',
        }}>
          {/* Progress Slider Track */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 240, 255, 0.18)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
          }}>
            {/* Filled Bar */}
            <div style={{
              height: '100%',
              width: `${clampedProgress}%`,
              background: 'linear-gradient(90deg, #0077ff 0%, #00d8ff 70%, #50f4ff 100%)',
              borderRadius: '9999px',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.8), 0 0 24px rgba(0, 119, 255, 0.4)',
              transition: 'width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              position: 'relative',
            }}>
              {/* Shimmer light pass */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '40%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                animation: 'shimmer-move 1.6s infinite linear',
              }} />
            </div>
          </div>

          {/* Slider Meta Labels (Stream / 0% / 100%) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.65rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.74rem',
          }}>
            <span style={{ color: '#566b88', letterSpacing: '0.12em', fontWeight: 600 }}>
              STREAM PROGRESS
            </span>
            <span style={{
              color: clampedProgress < 100 ? '#00f0ff' : '#00ffaa',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
            }}>
              {clampedProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
