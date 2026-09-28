import { useEffect, useRef } from 'react';

// MeshField - interactive dot field covering the entire website.
// Rendered on a fixed full-viewport canvas behind all content.
// Features:
// - Continuous grid of dots across the entire screen
// - Parallax motion against cursor movement
// - Dynamic cursor glow using gradient colors #00D8FF and #FF3BBF
// - Proximity interaction: dots nudge away, expand, and light up in a
//   gradient from #00D8FF (inner core) to #FF3BBF (outer interaction halo)
// - Idle wander animation when pointer is inactive
// - Reduced-motion fallback

export default function MeshField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0;
    let H = 0;
    let gap = 32;
    let cols = 0;
    let rows = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, has: false };
    let running = true;
    let last = 0;
    let t = 0;
    let raf = 0;

    function size() {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      cv!.width = W * dpr;
      cv!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 760 ? 26 : 34;
      cols = Math.ceil(W / gap) + 3;
      rows = Math.ceil(H / gap) + 3;
    }

    function draw(now: number) {
      if (!running) return;
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      t += dt;

      // Ease the cursor target for weighty, organic response
      if (!mouse.has) {
        mouse.tx = W * (0.5 + 0.28 * Math.sin(t * 0.35));
        mouse.ty = H * (0.45 + 0.22 * Math.cos(t * 0.28));
      }
      mouse.x += (mouse.tx - mouse.x) * 0.085;
      mouse.y += (mouse.ty - mouse.y) * 0.085;

      ctx!.clearRect(0, 0, W, H);

      // Tighter, refined interaction reach & glow size
      const reach = W < 760 ? 95 : 125;
      const push = 7;
      const R = reach * 1.35; // compact radial backdrop glow

      // Background ambient radial glow using the two gradient colors:
      // #00D8FF (rgb(0, 216, 255)) and #FF3BBF (rgb(255, 59, 191))
      const glow = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R);
      glow.addColorStop(0, 'rgba(0, 216, 255, 0.16)');
      glow.addColorStop(0.35, 'rgba(255, 59, 191, 0.08)');
      glow.addColorStop(0.75, 'rgba(255, 59, 191, 0.015)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, W, H);

      // Grid parallax offset
      const px = (mouse.x / W - 0.5) * -12;
      const py = (mouse.y / H - 0.5) * -12;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * gap - gap + px;
          let y = r * gap - gap + py;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d = Math.hypot(dx, dy);

          let q = 0;
          if (d < reach) {
            const rawQ = 1 - d / reach;
            q = rawQ * rawQ;
            const f = (push * q) / (d + 0.001);
            x += dx * f;
            y += dy * f;
          }

          if (q > 0.02) {
            // Gradient interaction between #00D8FF and #FF3BBF:
            // Core / inner radius: #00D8FF (0, 216, 255)
            // Mid / outer boundary: #FF3BBF (255, 59, 191)
            const tGrad = Math.min(1, Math.max(0, (d - reach * 0.15) / (reach * 0.65)));
            const red = Math.round(0 + (255 - 0) * tGrad);
            const green = Math.round(216 + (59 - 216) * tGrad);
            const blue = Math.round(255 + (191 - 255) * tGrad);
            const alpha = 0.25 + 0.75 * q;
            const size = 1.3 + 1.4 * q;

            ctx!.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
            ctx!.beginPath();
            ctx!.arc(x, y, size, 0, Math.PI * 2);
            ctx!.fill();
          } else {
            // Calm resting dot
            ctx!.fillStyle = 'rgba(175, 205, 235, 0.18)';
            ctx!.beginPath();
            ctx!.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onPointer(e: PointerEvent) {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.has = true;
    }

    function onLeave() {
      mouse.has = false;
    }

    size();
    if (reduced) {
      // Single still frame for users who prefer reduced motion
      mouse.tx = W * 0.5;
      mouse.ty = H * 0.45;
      mouse.x = mouse.tx;
      mouse.y = mouse.ty;
      draw(performance.now());
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', size);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', size);
    };
  }, []);

  return <canvas ref={canvasRef} className="mesh-field" aria-hidden="true" />;
}
