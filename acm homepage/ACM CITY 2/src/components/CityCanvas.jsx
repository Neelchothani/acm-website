import React, { useEffect, useRef } from 'react';

export const CityCanvas = ({ canvasRef: externalRef, style = {} }) => {
  const internalRef = useRef(null);
  const ref = externalRef || internalRef;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const applySize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Re-apply smoothing after every canvas resize
      // (assigning canvas.width resets all context state)
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };

    applySize();
    window.addEventListener('resize', applySize);
    return () => window.removeEventListener('resize', applySize);
  }, [ref]);

  return (
    <canvas
      ref={ref}
      id="acm-city-canvas"
      style={{ display: 'block', position: 'fixed', top: 0, left: 0, ...style }}
    />
  );
};

