import React, { useEffect, useRef } from 'react';

/**
 * TransitionOverlay
 * Full-screen black overlay that fades in/out during page transitions.
 * Props:
 *   visible  {boolean} — when true, overlay is opaque; when false, transparent
 *   duration {number}  — CSS transition duration in ms (default 600)
 */
export default function TransitionOverlay({ visible, duration = 600 }) {
  const style = {
    position: 'fixed',
    inset: 0,
    background: '#000',
    zIndex: 10000,
    pointerEvents: visible ? 'all' : 'none',
    opacity: visible ? 1 : 0,
    transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return <div style={style} aria-hidden="true" />;
}
