import React, { useEffect, useRef } from 'react';

export default function HeroDotField({ fieldInteractRef, isReducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const sticky = cv.parentElement;

    let W = 0, H = 0, dpr = 1, gap = 30, cols = 0, rows = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, has: false };
    let k = 1, running = true, last = 0, t = 0;

    // Connect to external control
    if (fieldInteractRef) {
      fieldInteractRef.current = (v) => { k = v; };
    }

    function size() {
      if (!sticky) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = sticky.clientWidth;
      H = sticky.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 760 ? 24 : 30;
      cols = Math.ceil(W / gap) + 2;
      rows = Math.ceil(H / gap) + 2;
    }

    function draw(now) {
      if (!running) return;
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      t += dt;

      // ease the cursor so the field feels weighty, not twitchy
      if (!mouse.has) {
        mouse.tx = W * (0.5 + 0.28 * Math.sin(t * 0.33));
        mouse.ty = H * (0.42 + 0.22 * Math.cos(t * 0.27));
      }
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      ctx.clearRect(0, 0, W, H);

      // Localized subtle glow with #00D8FF and #FF3BBF
      const R = Math.max(130, Math.min(W, H) * 0.22);
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R);
      g.addColorStop(0, 'rgba(0, 216, 255, ' + (0.16 * k).toFixed(3) + ')');
      g.addColorStop(0.42, 'rgba(255, 59, 191, ' + (0.07 * k).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255, 59, 191, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // dots: reduced interactive reach and subtle push for clean grid constellation
      const px = (mouse.x / W - 0.5) * -6 * k, py = (mouse.y / H - 0.5) * -6 * k;
      const reach = Math.max(110, Math.min(W, H) * 0.18), push = 3.5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * gap - gap + px, y = r * gap - gap + py;
          const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
          if (d < reach) {
            const norm = (1 - d / reach) * k;
            const f = (push * norm * norm) / (d + 0.001);
            x += dx * f;
            y += dy * f;

            let rVal, gVal, bVal, aVal;
            if (norm > 0.52) {
              // Blend from #FF3BBF (255, 59, 191) to #00D8FF (0, 216, 255)
              const tNorm = (norm - 0.52) / 0.48;
              rVal = Math.round(255 * (1 - tNorm) + 0 * tNorm);
              gVal = Math.round(59 * (1 - tNorm) + 216 * tNorm);
              bVal = Math.round(191 * (1 - tNorm) + 255 * tNorm);
              aVal = 0.85 + 0.15 * tNorm;
            } else if (norm > 0.15) {
              // Blend from purple (145, 65, 185) to #FF3BBF (255, 59, 191)
              const tNorm = (norm - 0.15) / 0.37;
              rVal = Math.round(145 * (1 - tNorm) + 255 * tNorm);
              gVal = Math.round(65 * (1 - tNorm) + 59 * tNorm);
              bVal = Math.round(185 * (1 - tNorm) + 191 * tNorm);
              aVal = 0.45 + 0.40 * tNorm;
            } else {
              // Outer transition into idle dot
              const tNorm = norm / 0.15;
              rVal = Math.round(145 * tNorm + 160 * (1 - tNorm));
              gVal = Math.round(65 * tNorm + 170 * (1 - tNorm));
              bVal = Math.round(185 * tNorm + 200 * (1 - tNorm));
              aVal = 0.22 + 0.23 * tNorm;
            }

            const s = 1.25 + 1.5 * norm;
            ctx.fillStyle = 'rgba(' + rVal + ',' + gVal + ',' + bVal + ',' + aVal.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(x, y, s, 0, 6.2832);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(160, 170, 200, 0.22)';
            ctx.beginPath();
            ctx.arc(x, y, 1.25, 0, 6.2832);
            ctx.fill();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    const handlePointerMove = (e) => {
      const b = sticky.getBoundingClientRect();
      mouse.tx = e.clientX - b.left;
      mouse.ty = e.clientY - b.top;
      mouse.has = true;
    };

    const handlePointerLeave = () => {
      mouse.has = false;
    };

    sticky.addEventListener('pointermove', handlePointerMove);
    sticky.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', size);

    size();
    const animId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      sticky.removeEventListener('pointermove', handlePointerMove);
      sticky.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', size);
    };
  }, [isReducedMotion, fieldInteractRef]);

  if (isReducedMotion) {
    return <canvas className="field" id="field" style={{ display: 'none' }} aria-hidden="true" />;
  }

  return <canvas className="field" id="field" ref={canvasRef} aria-hidden="true" />;
}
