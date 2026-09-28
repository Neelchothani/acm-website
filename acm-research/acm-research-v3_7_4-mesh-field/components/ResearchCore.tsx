'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Holographic Quantum Research Core
// Completely replaces the globe with an interactive 3D Supercomputing / Quantum Core:
// 1. Tesseract (4D Hypercube projection with dimensional morphing)
// 2. Neural Core (Icosahedral geodesic crystalline lattice with synaptic laser pulses)
// 3. Quantum Gimbal (Gyroscopic multi-axis accelerator with levitating qubit singularity)
// Plus:
// - 5 Floating 3D Research Lab Shards connected by laser conduits
// - Full drag-to-rotate with inertia & momentum
// - Interactive hover detection & click-to-explore navigation
// - Live telemetry HUD, quantum coherence readout, and click shockwave bursts

export interface ResearchBeacon {
  id: string;
  name: string;
  short: string;
  glyph: string;
  lat: number;
  lon: number;
  color: string;
  rgb: string;
  tag: string;
}

export const RESEARCH_BEACONS: ResearchBeacon[] = [
  {
    id: 'ai-ml',
    name: 'Artificial Intelligence & ML',
    short: 'AI & Learning',
    glyph: '🧠',
    lat: 0.35,
    lon: 0.6,
    color: 'var(--cyan)',
    rgb: '34, 211, 238',
    tag: 'LAB 01',
  },
  {
    id: 'software',
    name: 'Software Systems & Dev',
    short: 'Software Systems',
    glyph: '💻',
    lat: -0.3,
    lon: 1.88,
    color: 'var(--cyan-soft)',
    rgb: '103, 232, 249',
    tag: 'LAB 02',
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity & Privacy',
    short: 'Cybersecurity',
    glyph: '🛡️',
    lat: 0.45,
    lon: 3.14,
    color: 'var(--magenta)',
    rgb: '232, 121, 249',
    tag: 'LAB 03',
  },
  {
    id: 'hci',
    name: 'Human-Computer Interaction',
    short: 'HCI & Design',
    glyph: '✨',
    lat: -0.22,
    lon: 4.45,
    color: 'var(--amber)',
    rgb: '251, 191, 36',
    tag: 'LAB 04',
  },
  {
    id: 'distributed',
    name: 'Distributed Systems & Cloud',
    short: 'Distributed & Cloud',
    glyph: '⚡',
    lat: 0.15,
    lon: 5.7,
    color: '#a78bfa',
    rgb: '167, 139, 250',
    tag: 'LAB 05',
  },
];

export type CoreMode = 'tesseract' | 'neural' | 'quantum';

interface ResearchCoreProps {
  activeBeaconIndex?: number | null;
  onHoverBeacon?: (index: number | null) => void;
  onSelectBeacon?: (beacon: ResearchBeacon) => void;
  mode?: CoreMode;
  onModeChange?: (mode: CoreMode) => void;
}

export default function ResearchCore({
  activeBeaconIndex = null,
  onHoverBeacon,
  onSelectBeacon,
  mode = 'tesseract',
  onModeChange,
}: ResearchCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [internalMode, setInternalMode] = useState<CoreMode>(mode);
  const [hoveredBeacon, setHoveredBeacon] = useState<ResearchBeacon | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [telemetry, setTelemetry] = useState({ rotX: 0, rotY: 0, coherence: '99.8%' });

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const onHoverBeaconRef = useRef(onHoverBeacon);
  onHoverBeaconRef.current = onHoverBeacon;
  const onSelectBeaconRef = useRef(onSelectBeacon);
  onSelectBeaconRef.current = onSelectBeacon;
  const activeIndexRef = useRef(activeBeaconIndex);
  activeIndexRef.current = activeBeaconIndex;
  const modeRef = useRef(internalMode);
  modeRef.current = internalMode;

  const handleModeSwitch = useCallback(
    (newMode: CoreMode) => {
      setInternalMode(newMode);
      onModeChange?.(newMode);
    },
    [onModeChange]
  );

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

    // Rotation & physics
    let rotY = 0.5;
    let rotX = -0.3;
    let rotW = 0.2; // 4th dimension rotation angle for Tesseract
    let velX = 0;
    let velY = 0.0025;
    let isPointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let scrollVel = 0;
    let lastScroll = window.scrollY;

    // Shockwave particle bursts
    interface QuantumPulse {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
      color: string;
      speed: number;
    }
    const pulses: QuantumPulse[] = [];

    // Pre-baked glow sprites
    function makeGlow(rgb: string) {
      const c = document.createElement('canvas');
      c.width = c.height = 48;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, `rgba(${rgb}, 1)`);
      grad.addColorStop(0.3, `rgba(${rgb}, 0.45)`);
      grad.addColorStop(0.7, `rgba(${rgb}, 0.12)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 48, 48);
      return c;
    }

    const glowCyan = makeGlow('34, 211, 238');
    const glowMag = makeGlow('232, 121, 249');
    const glowAmber = makeGlow('251, 191, 36');
    const glowTeal = makeGlow('103, 232, 249');
    const glowViolet = makeGlow('167, 139, 250');

    const glowMap: Record<string, HTMLCanvasElement> = {
      '34, 211, 238': glowCyan,
      '232, 121, 249': glowMag,
      '251, 191, 36': glowAmber,
      '103, 232, 249': glowTeal,
      '167, 139, 250': glowViolet,
    };

    let bgAuraGrad: CanvasGradient | null = null;

    function resize() {
      const rect = mount!.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.38;

      bgAuraGrad = ctx!.createRadialGradient(w / 2, h / 2, R * 0.15, w / 2, h / 2, R * 1.85);
      bgAuraGrad.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
      bgAuraGrad.addColorStop(0.35, 'rgba(192, 38, 211, 0.08)');
      bgAuraGrad.addColorStop(0.7, 'rgba(16, 41, 78, 0.04)');
      bgAuraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    // 3D Point Projection Helper
    function project3D(x: number, y: number, z: number) {
      // Rotate around Y
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;

      // Rotate around X
      const rx = rotX + tiltX;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      const persp = 1 / (1 + z2 / (R * 3.8));
      return {
        x: w / 2 + (x1 + tiltY * R * 0.22) * persp,
        y: h / 2 + y2 * persp,
        z: z2,
        p: persp,
      };
    }

    // 4D Tesseract Vertices & Edges Generator
    // 16 vertices of 4D hypercube: (±1, ±1, ±1, ±1)
    const tesseractVertices: number[][] = [];
    for (let i = 0; i < 16; i++) {
      tesseractVertices.push([
        (i & 1 ? 1 : -1),
        (i & 2 ? 1 : -1),
        (i & 4 ? 1 : -1),
        (i & 8 ? 1 : -1),
      ]);
    }

    // 32 edges connecting vertices that differ by exactly 1 bit
    const tesseractEdges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          tesseractEdges.push([i, j]);
        }
      }
    }

    // Project 4D to 3D via 4D rotation in XW and ZW planes, then project to 2D
    function project4D(v: number[], t: number) {
      let [x, y, z, w4] = v;

      // Rotate in XW plane
      const cXW = Math.cos(rotW + t * 0.4), sXW = Math.sin(rotW + t * 0.4);
      const xRot = x * cXW - w4 * sXW;
      const wRot = x * sXW + w4 * cXW;

      // Rotate in ZW plane
      const cZW = Math.cos(rotW * 0.8 + t * 0.3), sZW = Math.sin(rotW * 0.8 + t * 0.3);
      const zRot = z * cZW - wRot * sZW;
      const wFinal = z * sZW + wRot * cZW;

      // 4D perspective projection to 3D
      const distance4D = 2.4;
      const p4 = 1 / (distance4D - wFinal * 0.48);
      const x3D = xRot * p4 * R * 1.05;
      const y3D = y * p4 * R * 1.05;
      const z3D = zRot * p4 * R * 1.05;

      return project3D(x3D, y3D, z3D);
    }

    // Mode 2: Icosahedral Geodesic Lattice
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseIco = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ].map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len];
    });

    // Subdivided geodesic points for rich crystalline density
    const icoVertices: [number, number, number][] = [...(baseIco as [number, number, number][])];
    for (let i = 0; i < baseIco.length; i++) {
      for (let j = i + 1; j < baseIco.length; j++) {
        const dx = baseIco[i][0] - baseIco[j][0];
        const dy = baseIco[i][1] - baseIco[j][1];
        const dz = baseIco[i][2] - baseIco[j][2];
        if (Math.hypot(dx, dy, dz) < 1.15) {
          const mx = (baseIco[i][0] + baseIco[j][0]) * 0.5;
          const my = (baseIco[i][1] + baseIco[j][1]) * 0.5;
          const mz = (baseIco[i][2] + baseIco[j][2]) * 0.5;
          const len = Math.hypot(mx, my, mz);
          icoVertices.push([mx / len, my / len, mz / len]);
        }
      }
    }

    // Mode 3: Quantum Gimbal Concentric Rings with Data Ticks
    function drawQuantumGimbals(t: number) {
      const rings = [
        { rad: R * 0.98, tiltX: 0.15, tiltZ: t * 0.35, color: 'rgba(34, 211, 238, 0.75)', dash: [6, 10], width: 1.6 },
        { rad: R * 0.82, tiltX: 1.25, tiltZ: -t * 0.55, color: 'rgba(232, 121, 249, 0.7)', dash: [14, 6], width: 1.8 },
        { rad: R * 0.65, tiltX: -0.85, tiltZ: t * 0.85, color: 'rgba(103, 232, 249, 0.85)', dash: [3, 8], width: 2.0 },
      ];

      for (const ring of rings) {
        ctx!.beginPath();
        const steps = 72;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const rx = ring.rad * Math.cos(theta);
          const ry = 0;
          const rz = ring.rad * Math.sin(theta);

          // Apply ring internal tilt
          const cX = Math.cos(ring.tiltX), sX = Math.sin(ring.tiltX);
          const y1 = ry * cX - rz * sX;
          const z1 = ry * sX + rz * cX;

          const cZ = Math.cos(ring.tiltZ), sZ = Math.sin(ring.tiltZ);
          const x2 = rx * cZ - y1 * sZ;
          const y2 = rx * sZ + y1 * cZ;

          const p = project3D(x2, y2, z1);
          if (s === 0) ctx!.moveTo(p.x, p.y);
          else ctx!.lineTo(p.x, p.y);
        }
        ctx!.strokeStyle = ring.color;
        ctx!.lineWidth = ring.width;
        ctx!.setLineDash(ring.dash);
        ctx!.stroke();
        ctx!.setLineDash([]);
      }

      // Central Levitating Singularity Core
      const coreP = project3D(0, Math.sin(t * 2.5) * 8, 0);
      const coreSize = 34 * coreP.p;
      ctx!.drawImage(glowCyan, coreP.x - coreSize, coreP.y - coreSize, coreSize * 2, coreSize * 2);
      ctx!.drawImage(glowMag, coreP.x - coreSize * 0.6, coreP.y - coreSize * 0.6, coreSize * 1.2, coreSize * 1.2);

      ctx!.fillStyle = '#ffffff';
      ctx!.beginPath();
      ctx!.arc(coreP.x, coreP.y, 7 * coreP.p, 0, Math.PI * 2);
      ctx!.fill();
    }

    // Main Draw Function
    let nearestBeaconUnderCursor: ResearchBeacon | null = null;
    let hoveredBeaconIdx: number | null = null;

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const curMode = modeRef.current;

      // 1. Quantum Atmospheric Background Halo
      if (bgAuraGrad) {
        ctx!.fillStyle = bgAuraGrad;
        ctx!.fillRect(0, 0, w, h);
      }

      // 2. Holographic Ground Grid Plane
      ctx!.save();
      const gridY = R * 0.88;
      const gridSize = R * 1.6;
      const gridSteps = 10;
      ctx!.strokeStyle = 'rgba(34, 211, 238, 0.08)';
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

      // 3. Render 3D Geometry Based on Mode
      if (curMode === 'tesseract') {
        // Project all 16 4D vertices
        const projected = tesseractVertices.map((v) => project4D(v, t));

        // Draw 32 Laser Edges
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
            // Struts connecting 4th dimension
            ctx!.strokeStyle = front
              ? 'rgba(232, 121, 249, 0.75)'
              : 'rgba(232, 121, 249, 0.25)';
            ctx!.lineWidth = front ? 2.0 : 1.2;
            ctx!.setLineDash([4, 6]);
            ctx!.lineDashOffset = -t * 12;
            ctx!.stroke();
            ctx!.setLineDash([]);
          } else {
            // Outer / Inner Cube edges
            ctx!.strokeStyle = front
              ? 'rgba(34, 211, 238, 0.85)'
              : 'rgba(34, 211, 238, 0.28)';
            ctx!.lineWidth = front ? 2.2 : 1.3;
            ctx!.stroke();
          }

          // Quantum Data Packet traveling on edges
          if (edgeIdx % 3 === 0) {
            const frac = (t * 0.8 + edgeIdx * 0.14) % 1;
            const px = p1.x + (p2.x - p1.x) * frac;
            const py = p1.y + (p2.y - p1.y) * frac;
            ctx!.fillStyle = '#ffffff';
            ctx!.beginPath();
            ctx!.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx!.fill();
          }
        });

        // Draw 16 Glowing Qubit Vertices
        projected.forEach((p, idx) => {
          const front = p.z < R * 0.15;
          const rad = (front ? 3.8 : 2.0) * p.p;
          const glow = idx >= 8 ? glowMag : glowCyan;
          const gs = rad * (front ? 10 : 5);

          ctx!.globalAlpha = front ? 0.95 : 0.4;
          ctx!.drawImage(glow, p.x - gs / 2, p.y - gs / 2, gs, gs);
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, rad * 0.6, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
        });
      } else if (curMode === 'neural') {
        // Geodesic Crystalline Lattice
        const pts = icoVertices.map(([vx, vy, vz]) => {
          const breath = 1 + 0.05 * Math.sin(t * 2.2 + vx * 2);
          const rScaled = R * 0.82 * breath;
          return project3D(vx * rScaled, vy * rScaled, vz * rScaled);
        });

        // Draw Interconnecting Facets / Constellations
        for (let a = 0; a < pts.length; a++) {
          if (pts[a].z > R * 0.4) continue;
          for (let b = a + 1; b < pts.length; b++) {
            if (pts[b].z > R * 0.4) continue;
            const dist = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
            if (dist < 88) {
              const alpha = (1 - dist / 88) * 0.55;
              ctx!.beginPath();
              ctx!.moveTo(pts[a].x, pts[a].y);
              ctx!.lineTo(pts[b].x, pts[b].y);
              ctx!.strokeStyle = `rgba(34, 211, 238, ${alpha.toFixed(3)})`;
              ctx!.lineWidth = (1 - dist / 88) * 2;
              ctx!.stroke();
            }
          }
        }

        // Vertices
        pts.forEach((p, i) => {
          const front = p.z < R * 0.15;
          const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.5);
          const rad = (front ? 3.5 : 1.8) * p.p;
          const glow = i % 2 === 0 ? glowCyan : glowMag;
          const gs = rad * 8;

          ctx!.globalAlpha = front ? 0.9 : 0.35;
          ctx!.drawImage(glow, p.x - gs / 2, p.y - gs / 2, gs, gs);
          ctx!.fillStyle = pulse > 0.8 ? '#ffffff' : 'rgba(214, 245, 255, 0.9)';
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, rad * 0.65, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
        });

        // Pulsing Central Core
        const centerP = project3D(0, 0, 0);
        const cGlow = 42 * centerP.p;
        ctx!.drawImage(glowMag, centerP.x - cGlow, centerP.y - cGlow, cGlow * 2, cGlow * 2);
      } else {
        // Quantum Gimbal Mode
        drawQuantumGimbals(t);
      }

      // 4. Floating 3D Research Lab Shards / Beacons (Orbiting the Core)
      let currentActiveIdx = activeIndexRef.current;
      nearestBeaconUnderCursor = null;
      hoveredBeaconIdx = null;

      RESEARCH_BEACONS.forEach((beacon, idx) => {
        // Orbit in 3D around the core
        const orbitR = R * 1.25;
        const orbitSpeed = t * 0.25;
        const currentLon = beacon.lon + orbitSpeed;
        const bX = orbitR * Math.cos(beacon.lat) * Math.cos(currentLon);
        const bY = orbitR * Math.sin(beacon.lat);
        const bZ = orbitR * Math.cos(beacon.lat) * Math.sin(currentLon);

        const p = project3D(bX, bY, bZ);
        const isFacing = p.z < R * 0.35;
        const isTargeted = currentActiveIdx === idx;

        // Proximity detection for mouse interaction
        const dx = lastPointerX - p.x;
        const dy = lastPointerY - p.y;
        const dist = Math.hypot(dx, dy);
        const isHovered = isFacing && dist < 26;

        if (isHovered) {
          nearestBeaconUnderCursor = beacon;
          hoveredBeaconIdx = idx;
        }

        const active = isTargeted || isHovered;

        if (isFacing) {
          const glow = glowMap[beacon.rgb] || glowCyan;

          // Laser Conduit linking beacon to the quantum core
          const coreP = project3D(0, 0, 0);
          ctx!.beginPath();
          ctx!.moveTo(coreP.x, coreP.y);
          ctx!.lineTo(p.x, p.y);
          ctx!.strokeStyle = active
            ? `rgba(${beacon.rgb}, 0.85)`
            : `rgba(${beacon.rgb}, 0.25)`;
          ctx!.lineWidth = active ? 2 : 1;
          ctx!.setLineDash(active ? [] : [4, 8]);
          ctx!.stroke();
          ctx!.setLineDash([]);

          // Glowing Concentric Target Rings
          const ringPulse = (t * 2.8 + idx * 0.9) % 1;
          const outerR = (12 + ringPulse * 18) * p.p;
          const ringAlpha = (1 - ringPulse) * (active ? 0.95 : 0.6);

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, outerR, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${beacon.rgb}, ${ringAlpha.toFixed(3)})`;
          ctx!.lineWidth = active ? 2.2 : 1.2;
          ctx!.stroke();

          // Reticle Target Box when active
          if (active) {
            const boxS = 18 * p.p;
            ctx!.strokeStyle = '#ffffff';
            ctx!.lineWidth = 1.4;
            ctx!.strokeRect(p.x - boxS, p.y - boxS, boxS * 2, boxS * 2);
          }

          // Central glowing crystal pip
          const pipSize = (active ? 30 : 20) * p.p;
          ctx!.drawImage(glow, p.x - pipSize, p.y - pipSize, pipSize * 2, pipSize * 2);

          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, (active ? 5.0 : 3.4) * p.p, 0, Math.PI * 2);
          ctx!.fill();

          // Holographic HUD Badge on canvas
          ctx!.save();
          ctx!.font = `${active ? 'bold 11px' : '10px'} "JetBrains Mono", monospace`;
          const labelText = `${beacon.tag} // ${beacon.short}`;
          const metrics = ctx!.measureText(labelText);
          const hudW = metrics.width + 16;
          const hudH = 22;
          const hudX = p.x + 14;
          const hudY = p.y - 11;

          // Box backdrop
          ctx!.fillStyle = active
            ? 'rgba(7, 14, 32, 0.94)'
            : 'rgba(7, 14, 32, 0.76)';
          ctx!.strokeStyle = `rgba(${beacon.rgb}, ${active ? 0.95 : 0.4})`;
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.roundRect(hudX, hudY, hudW, hudH, 4);
          ctx!.fill();
          ctx!.stroke();

          // Text
          ctx!.fillStyle = active ? '#ffffff' : `rgba(${beacon.rgb}, 0.95)`;
          ctx!.fillText(labelText, hudX + 8, hudY + 15);
          ctx!.restore();
        } else {
          // Subtle back-facing beacon
          ctx!.fillStyle = `rgba(${beacon.rgb}, 0.22)`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2.5 * p.p, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      // 5. Quantum Pulse Shockwaves
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.r += pulse.speed;
        pulse.alpha *= 0.94;
        ctx!.beginPath();
        ctx!.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${pulse.color}, ${pulse.alpha.toFixed(3)})`;
        ctx!.lineWidth = 2.4;
        ctx!.stroke();
        if (pulse.alpha < 0.02 || pulse.r > pulse.maxR) {
          pulses.splice(i, 1);
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

      // Coupled scroll acceleration
      const sc = window.scrollY;
      scrollVel += (sc - lastScroll) * 0.00055;
      lastScroll = sc;
      scrollVel *= 0.92;

      // Inertia update
      if (!isPointerDown) {
        rotY += velY + scrollVel;
        rotX += velX;
        rotW += 0.0035;
        velY = velY * 0.96 + 0.0025 * 0.04;
        velX *= 0.95;
      }

      // Parallax mouse tilt
      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;

      draw(t);

      // Notify parent on beacon hover
      if (hoveredBeaconIdx !== null) {
        onHoverBeaconRef.current?.(hoveredBeaconIdx);
        setHoveredBeacon(nearestBeaconUnderCursor);
        canvas!.style.cursor = 'pointer';
      } else {
        if (!isPointerDown) {
          onHoverBeaconRef.current?.(null);
          setHoveredBeacon(null);
          canvas!.style.cursor = 'grab';
        }
      }

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

    // Pointer Interactivity (Drag to Rotate 3D Core)
    function onPointerDown(e: PointerEvent) {
      isPointerDown = true;
      setIsDragging(true);
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      velX = 0;
      velY = 0;
      canvas!.setPointerCapture(e.pointerId);
      canvas!.style.cursor = 'grabbing';
    }

    function onPointerMove(e: PointerEvent) {
      const rect = mount!.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      lastPointerX = localX;
      lastPointerY = localY;

      if (isPointerDown) {
        const dx = e.movementX || (e.clientX - lastPointerX);
        const dy = e.movementY || (e.clientY - lastPointerY);
        velY = dx * 0.007;
        velX = dy * 0.007;
        rotY += velY;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
        setTelemetry({
          rotX: Math.round(rotX * (180 / Math.PI)),
          rotY: Math.round(rotY * (180 / Math.PI)) % 360,
          coherence: '99.8%',
        });
      } else {
        const nx = (localX - w / 2) / (w / 2);
        const ny = (localY - h / 2) / (h / 2);
        targetTiltY = Math.max(-1, Math.min(1, nx)) * 0.85;
        targetTiltX = Math.max(-1, Math.min(1, ny)) * 0.28;
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!isPointerDown) return;
      isPointerDown = false;
      setIsDragging(false);
      try {
        canvas!.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      canvas!.style.cursor = hoveredBeaconIdx !== null ? 'pointer' : 'grab';
    }

    function onClick(e: MouseEvent) {
      const rect = mount!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (nearestBeaconUnderCursor) {
        onSelectBeaconRef.current?.(nearestBeaconUnderCursor);
        pulses.push({
          x: clickX,
          y: clickY,
          r: 8,
          maxR: 110,
          alpha: 1,
          color: nearestBeaconUnderCursor.rgb,
          speed: 4.2,
        });
        return;
      }

      pulses.push({
        x: clickX,
        y: clickY,
        r: 8,
        maxR: 130,
        alpha: 0.85,
        color: '34, 211, 238',
        speed: 3.8,
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

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('click', onClick);

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="planet-stage research-core-stage" ref={mountRef}>
      <div className="planet-mount">
        <canvas
          ref={canvasRef}
          className={`planet-canvas ${isDragging ? 'is-dragging' : ''}`}
          aria-label="Interactive 3D Quantum Research Core. Drag to rotate in 3D, click nodes to explore."
        />
      </div>

      {/* Floating Interactive Controls HUD */}
      <div className="planet-hud-panel" aria-hidden="true">
        <div className="planet-mode-selector">
          <button
            type="button"
            className={`mode-btn ${internalMode === 'tesseract' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('tesseract')}
            title="4D Hypercube Tesseract"
          >
            TESSERACT
          </button>
          <button
            type="button"
            className={`mode-btn ${internalMode === 'neural' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('neural')}
            title="Neural Crystalline Lattice"
          >
            NEURAL
          </button>
          <button
            type="button"
            className={`mode-btn ${internalMode === 'quantum' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('quantum')}
            title="Quantum Gimbal Accelerator"
          >
            QUANTUM
          </button>
        </div>

        <div className="planet-telemetry-badge">
          <span className="telemetry-dot" />
          <span className="telemetry-text">
            CORE // YAW {telemetry.rotY}° • PITCH {telemetry.rotX}°
          </span>
          <span className="drag-hint">[ DRAG TO ORBIT CORE ]</span>
        </div>
      </div>

      {/* Hover Card Overlay */}
      {hoveredBeacon && (
        <div
          className="planet-beacon-tooltip"
          style={{ borderColor: `rgba(${hoveredBeacon.rgb}, 0.65)` }}
        >
          <div className="tooltip-header">
            <span className="tooltip-glyph">{hoveredBeacon.glyph}</span>
            <div>
              <div className="tooltip-tag" style={{ color: `rgb(${hoveredBeacon.rgb})` }}>
                {hoveredBeacon.tag}
              </div>
              <div className="tooltip-name">{hoveredBeacon.name}</div>
            </div>
          </div>
          <div className="tooltip-cta">Click node to explore domain →</div>
        </div>
      )}
    </div>
  );
}
