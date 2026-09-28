'use client';

import { useEffect, useRef } from 'react';

// FooterWave - the footer's live neon wavefield: layered glowing sine
// ribbons in the chapter palette drifting across the full width, with a few
// rising ember particles. Canvas-rendered, IO-paused, reduced-motion safe.

export default function FooterWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let start = 0;
    let embers: { x: number; y: number; r: number; speed: number; hue: number; phase: number }[] = [];

    const waves = [
      { amp: 0.22, freq: 1.6, speed: 0.5, yBase: 0.62, hue: 190, width: 2.2, alpha: 0.85 },
      { amp: 0.16, freq: 2.3, speed: -0.38, yBase: 0.55, hue: 305, width: 1.7, alpha: 0.7 },
      { amp: 0.12, freq: 3.1, speed: 0.62, yBase: 0.72, hue: 162, width: 1.3, alpha: 0.5 },
      { amp: 0.28, freq: 1.1, speed: -0.25, yBase: 0.48, hue: 38, width: 1.1, alpha: 0.35 },
    ];

    function build() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      embers = Array.from({ length: 22 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.8 + Math.random() * 1.6,
        speed: 0.02 + Math.random() * 0.05,
        hue: Math.random() < 0.5 ? 190 : Math.random() < 0.75 ? 305 : 38,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      // waves, back to front
      for (const wave of waves) {
        ctx!.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const fx = i / steps;
          const y =
            h * wave.yBase +
            Math.sin(fx * Math.PI * 2 * wave.freq + t * wave.speed * 2) * h * wave.amp +
            Math.sin(fx * Math.PI * 4.7 + t * wave.speed * 3.4) * h * wave.amp * 0.3;
          if (i === 0) ctx!.moveTo(fx * w, y);
          else ctx!.lineTo(fx * w, y);
        }
        // glow via a wide low-alpha underlay stroke (shadowBlur forces a
        // software blur per stroke and is the main cost here)
        ctx!.strokeStyle = `hsla(${wave.hue}, 95%, 62%, ${(wave.alpha * 0.4).toFixed(3)})`;
        ctx!.lineWidth = wave.width * 3.4;
        ctx!.stroke();
        ctx!.strokeStyle = `hsla(${wave.hue}, 95%, 65%, ${wave.alpha})`;
        ctx!.lineWidth = wave.width;
        ctx!.stroke();
      }
      // rising embers
      for (const e of embers) {
        e.y -= e.speed / 60;
        if (e.y < -0.05) {
          e.y = 1.05;
          e.x = Math.random();
        }
        const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + e.phase));
        ctx!.fillStyle = `hsla(${e.hue}, 95%, 70%, ${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(e.x * w + Math.sin(t + e.phase) * 6, e.y * h, e.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(now: number) {
      if (!running) return;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (running || reduced) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    build();
    draw(0.4);
    if (!reduced) play();

    const ro = new ResizeObserver(() => {
      build();
      draw(0.4);
    });
    ro.observe(canvas.parentElement!);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="footer-wave" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
