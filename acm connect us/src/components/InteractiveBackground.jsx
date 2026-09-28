import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates (default off-screen or center initially)
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handlePointerLeave = () => {
      mouse.isHovered = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', handlePointerLeave);

    // Grid configuration
    const spacing = 32; // Distance between dots
    const radiusThreshold = 110; // Compact radius of highlight around cursor (about 3 dots)

    const render = () => {
      // Smooth lerp mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 216, 255, 0.025)';
      ctx.beginPath();
      for (let x = 0; x < width; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Draw soft ambient cursor glow matching #00D8FF and #FF3BBF
      if (mouse.isHovered || true) {
        const ambientGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          radiusThreshold
        );
        ambientGlow.addColorStop(0, 'rgba(0, 216, 255, 0.22)');
        ambientGlow.addColorStop(0.5, 'rgba(255, 59, 191, 0.12)');
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = ambientGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radiusThreshold, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw grid dots with proximity highlighting
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const dotX = i * spacing;
          const dotY = j * spacing;

          const dx = dotX - mouse.x;
          const dy = dotY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          ctx.beginPath();

          if (dist < radiusThreshold) {
            // Normalized distance: 0 (at cursor) to 1 (at outer edge)
            const t = dist / radiusThreshold;
            const factor = 1 - t; // 1 at center, 0 at edge

            // Dot size scales up near cursor (tighter scaling)
            const dotRadius = 1.3 + factor * 2.2;

            if (t < 0.44) {
              // Inner core: Electric Cyan (#00D8FF)
              const alpha = 0.6 + factor * 0.4;
              ctx.fillStyle = `rgba(0, 216, 255, ${alpha.toFixed(2)})`;
              ctx.shadowColor = '#00D8FF';
              ctx.shadowBlur = 6 * factor;
            } else {
              // Outer halo ring: Neon Pink (#FF3BBF)
              const alpha = 0.35 + factor * 0.55;
              ctx.fillStyle = `rgba(255, 59, 191, ${alpha.toFixed(2)})`;
              ctx.shadowColor = '#FF3BBF';
              ctx.shadowBlur = 4 * factor;
            }

            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          } else {
            // Idle background dot
            ctx.fillStyle = 'rgba(75, 95, 160, 0.28)';
            ctx.arc(dotX, dotY, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
