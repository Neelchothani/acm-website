'use client';

import { useEffect, useRef } from 'react';

// TesseractBackground: Fullscreen 4D Hypercube background engine
// - Projects a 16-vertex, 32-edge 4D hypercube onto 3D, then 2D with perspective
// - Continuous 4D rotation through XW, YW, and ZW planes (geometric inversion)
// - Mouse parallax and interactive drag-to-orbit with inertia
// - Quantum qubit nodes, travelling laser data packets, and ambient star/quantum dust
// - Coupled to scroll velocity for warp acceleration

export default function TesseractBackground({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mount = mountRef.current;
    if (!canvas || !mount) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, R = 0;
    let raf = 0;
    let running = false;

    // 3D & 4D rotation state
    let rotY = 0.45;
    let rotX = -0.22;
    let rotW = 0.15; // 4D rotation angle
    let rotYW = 0.1;
    let velX = 0;
    let velY = 0.0022;
    let isPointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let scrollVel = 0;
    let lastScroll = window.scrollY;

    // Shockwave ripples on click
    interface Ripple {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    }
    const ripples: Ripple[] = [];

    // Pre-baked radial glow sprites
    function makeGlow(rgb: string) {
      const c = document.createElement('canvas');
      c.width = c.height = 48;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, `rgba(${rgb}, 1)`);
      grad.addColorStop(0.3, `rgba(${rgb}, 0.5)`);
      grad.addColorStop(0.7, `rgba(${rgb}, 0.15)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 48, 48);
      return c;
    }

    const glowCyan = makeGlow('34, 211, 238');
    const glowMag = makeGlow('232, 121, 249');
    const glowSoftCyan = makeGlow('103, 232, 249');

    // 16 Vertices of 4D Hypercube (±1, ±1, ±1, ±1)
    const tesseractVertices: number[][] = [];
    for (let i = 0; i < 16; i++) {
      tesseractVertices.push([
        (i & 1 ? 1 : -1),
        (i & 2 ? 1 : -1),
        (i & 4 ? 1 : -1),
        (i & 8 ? 1 : -1),
      ]);
    }

    // 32 Edges connecting vertices that differ by exactly 1 bit
    const tesseractEdges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          tesseractEdges.push([i, j]);
        }
      }
    }

    // Ambient floating quantum dust particles
    const DUST_COUNT = 45;
    const dustParticles: { x: number; y: number; z: number; s: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustParticles.push({
        x: (Math.random() - 0.5) * 2.8,
        y: (Math.random() - 0.5) * 2.2,
        z: (Math.random() - 0.5) * 2.5,
        s: 1.0 + Math.random() * 2.0,
        alpha: 0.2 + Math.random() * 0.6,
        speed: 0.1 + Math.random() * 0.3,
      });
    }

    let coreGlowGrad: CanvasGradient | null = null;

    function resize() {
      const rect = mount!.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Scaled up for majestic background presence
      R = Math.min(w, h) * 0.42;

      coreGlowGrad = ctx!.createRadialGradient(w / 2, h / 2, R * 0.1, w / 2, h / 2, R * 1.6);
      coreGlowGrad.addColorStop(0, 'rgba(34, 211, 238, 0.16)');
      coreGlowGrad.addColorStop(0.35, 'rgba(232, 121, 249, 0.07)');
      coreGlowGrad.addColorStop(0.7, 'rgba(16, 41, 78, 0.03)');
      coreGlowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    // 3D Point Projection to 2D Screen
    function project3D(x: number, y: number, z: number) {
      // Rotate around Y (yaw)
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;

      // Rotate around X (pitch)
      const rx = rotX + tiltX;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      const persp = 1 / (1 + z2 / (R * 4.2));
      return {
        x: w / 2 + (x1 + tiltY * R * 0.28) * persp,
        y: h / 2 + y2 * persp,
        z: z2,
        p: persp,
      };
    }

    // 4D Point Projection to 3D via 4D rotation matrices
    function project4D(v: number[], t: number) {
      let [x, y, z, w4] = v;

      // 4D Rotation in XW plane
      const cXW = Math.cos(rotW + t * 0.38), sXW = Math.sin(rotW + t * 0.38);
      const xRot = x * cXW - w4 * sXW;
      const wRot = x * sXW + w4 * cXW;

      // 4D Rotation in ZW plane
      const cZW = Math.cos(rotW * 0.75 + t * 0.28), sZW = Math.sin(rotW * 0.75 + t * 0.28);
      const zRot = z * cZW - wRot * sZW;
      const wFinal = z * sZW + wRot * cZW;

      // 4D Rotation in YW plane for extra dimensional fluidity
      const cYW = Math.cos(rotYW + t * 0.22), sYW = Math.sin(rotYW + t * 0.22);
      const yRot = y * cYW - wFinal * sYW;

      // 4D Perspective Projection into 3D space
      const distance4D = 2.45;
      const p4 = 1 / (distance4D - wFinal * 0.44);
      const x3D = xRot * p4 * R * 1.15;
      const y3D = yRot * p4 * R * 1.15;
      const z3D = zRot * p4 * R * 1.15;

      return project3D(x3D, y3D, z3D);
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);

      // 1. Quantum Atmospheric Ambient Halo
      if (coreGlowGrad) {
        ctx!.fillStyle = coreGlowGrad;
        ctx!.fillRect(0, 0, w, h);
      }

      // 2. Perspective Ground Horizon Grid
      ctx!.save();
      const gridY = R * 1.1;
      const gridSize = R * 2.2;
      const gridSteps = 12;
      ctx!.strokeStyle = 'rgba(34, 211, 238, 0.055)';
      ctx!.lineWidth = 1;

      for (let i = -gridSteps; i <= gridSteps; i++) {
        const p1 = project3D((i / gridSteps) * gridSize, gridY, -gridSize);
        const p2 = project3D((i / gridSteps) * gridSize, gridY, gridSize);
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);
        ctx!.stroke();

        const p3 = project3D(-gridSize, gridY, (i / gridSteps) * gridSize);
        const p4 = project3D(gridSize, gridY, (i / gridSteps) * gridSize);
        ctx!.beginPath();
        ctx!.moveTo(p3.x, p3.y);
        ctx!.lineTo(p4.x, p4.y);
        ctx!.stroke();
      }
      ctx!.restore();

      // 3. Floating Quantum Dust
      for (const d of dustParticles) {
        const p = project3D(d.x * R, (d.y + Math.sin(t * d.speed + d.x) * 0.15) * R, d.z * R);
        const alpha = Math.min(1, d.alpha * (p.z < 0 ? 0.9 : 0.35));
        ctx!.fillStyle = `rgba(186, 245, 255, ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, d.s * p.p, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 4. Project 16 4D Vertices of the Tesseract
      const projected = tesseractVertices.map((v) => project4D(v, t));

      // 5. Draw 32 Laser Vector Edges
      tesseractEdges.forEach(([i, j], edgeIdx) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const midZ = (p1.z + p2.z) * 0.5;
        const front = midZ < R * 0.15;
        const isInterDimensional = (i < 8 && j >= 8) || (j < 8 && i >= 8);

        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);

        if (isInterDimensional) {
          // Cross-dimensional struts connecting inner and outer cubes
          ctx!.strokeStyle = front
            ? 'rgba(232, 121, 249, 0.75)'
            : 'rgba(232, 121, 249, 0.22)';
          ctx!.lineWidth = front ? 1.8 : 1.1;
          ctx!.setLineDash([5, 7]);
          ctx!.lineDashOffset = -t * 15;
          ctx!.stroke();
          ctx!.setLineDash([]);
        } else {
          // Primary Cube Edges
          ctx!.strokeStyle = front
            ? 'rgba(34, 211, 238, 0.82)'
            : 'rgba(34, 211, 238, 0.25)';
          ctx!.lineWidth = front ? 2.2 : 1.2;
          ctx!.stroke();
        }

        // Quantum Data Pulse traveling along select edges
        if (edgeIdx % 2 === 0) {
          const frac = (t * 0.75 + edgeIdx * 0.12) % 1;
          const px = p1.x + (p2.x - p1.x) * frac;
          const py = p1.y + (p2.y - p1.y) * frac;
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(px, py, (front ? 2.8 : 1.6) * p1.p, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      // 6. Draw 16 Glowing Qubit Vertices
      projected.forEach((p, idx) => {
        const front = p.z < R * 0.15;
        const rad = (front ? 4.2 : 2.2) * p.p;
        const glow = idx >= 8 ? glowMag : glowCyan;
        const gs = rad * (front ? 11 : 6);

        ctx!.globalAlpha = front ? 0.95 : 0.38;
        ctx!.drawImage(glow, p.x - gs / 2, p.y - gs / 2, gs, gs);
        ctx!.fillStyle = '#ffffff';
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, rad * 0.65, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // 7. Central Quantum Singularity
      const coreP = project3D(0, 0, 0);
      const cSize = 38 * coreP.p;
      ctx!.drawImage(glowSoftCyan, coreP.x - cSize, coreP.y - cSize, cSize * 2, cSize * 2);
      ctx!.drawImage(glowMag, coreP.x - cSize * 0.6, coreP.y - cSize * 0.6, cSize * 1.2, cSize * 1.2);

      // 8. Click Shockwave Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 4.5;
        rp.alpha *= 0.94;
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(34, 211, 238, ${rp.alpha.toFixed(3)})`;
        ctx!.lineWidth = 2.0;
        ctx!.stroke();
        if (rp.alpha < 0.02 || rp.r > rp.maxR) {
          ripples.splice(i, 1);
        }
      }
    }

    // Animation Loop
    let lastDraw = 0;
    function frame(now: number) {
      if (!running) return;
      if (now - lastDraw < 16) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      const t = now / 1000;

      // Couples scroll speed to 4D rotation acceleration (warp speed effect)
      const sc = window.scrollY;
      scrollVel += (sc - lastScroll) * 0.00065;
      lastScroll = sc;
      scrollVel *= 0.92;

      if (!isPointerDown) {
        rotY += velY + scrollVel;
        rotX += velX;
        rotW += 0.003 + Math.abs(scrollVel) * 2;
        rotYW += 0.0018;
        velY = velY * 0.96 + 0.0022 * 0.04;
        velX *= 0.95;
      }

      tiltX += (targetTiltX - tiltX) * 0.06;
      tiltY += (targetTiltY - tiltY) * 0.06;

      draw(t);
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // Pointer Interactivity (Drag to Rotate 4D Tesseract)
    function onPointerDown(e: PointerEvent) {
      // Only capture if target is canvas or empty hero space
      isPointerDown = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      velX = 0;
      velY = 0;
    }

    function onPointerMove(e: PointerEvent) {
      const rect = mount!.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (isPointerDown) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        velY = dx * 0.006;
        velX = dy * 0.006;
        rotY += velY;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
      } else {
        const nx = (localX - w / 2) / (w / 2);
        const ny = (localY - h / 2) / (h / 2);
        targetTiltY = Math.max(-1, Math.min(1, nx)) * 0.8;
        targetTiltX = Math.max(-1, Math.min(1, ny)) * 0.25;
      }
    }

    function onPointerUp() {
      isPointerDown = false;
    }

    function onClick(e: MouseEvent) {
      const rect = mount!.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 10,
        maxR: Math.min(w, h) * 0.7,
        alpha: 0.9,
      });
    }

    resize();
    draw(0.1);
    if (!reduced) play();

    const ro = new ResizeObserver(() => {
      resize();
      draw(0.1);
    });
    ro.observe(mount);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.02 }
    );
    io.observe(canvas);

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('click', onClick);

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className={`tesseract-background-container ${className || ''}`} ref={mountRef}>
      <canvas
        ref={canvasRef}
        className="tesseract-canvas"
        aria-hidden="true"
      />
    </div>
  );
}
