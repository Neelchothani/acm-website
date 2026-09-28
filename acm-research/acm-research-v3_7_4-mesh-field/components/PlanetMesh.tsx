'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Enhanced interactive 3D Planet Mesh:
// - Full drag-to-rotate (orbit & pitch) with inertia & smooth decay
// - Cursor parallax tracking & dynamic celestial rotation
// - Interactive research node beacons with 3D projection, hover reticles & click navigation
// - 3 visual modes: Grid (Geodesic matrix), Synapse (Neural network links), Flux (High-velocity orbital rings)
// - Shockwave ripple on click / tap
// - Live HUD telemetry readout (angles, rotation speed, active node)

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
    lat: 0.32,
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
    lat: -0.28,
    lon: 1.85,
    color: 'var(--cyan-soft)',
    rgb: '103, 232, 249',
    tag: 'LAB 02',
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity & Privacy',
    short: 'Cybersecurity',
    glyph: '🛡️',
    lat: 0.44,
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
    lat: -0.18,
    lon: 4.4,
    color: 'var(--amber)',
    rgb: '251, 191, 36',
    tag: 'LAB 04',
  },
  {
    id: 'distributed',
    name: 'Distributed Systems & Cloud',
    short: 'Distributed & Cloud',
    glyph: '⚡',
    lat: 0.12,
    lon: 5.65,
    color: '#a78bfa',
    rgb: '167, 139, 250',
    tag: 'LAB 05',
  },
];

interface PlanetMeshProps {
  activeBeaconIndex?: number | null;
  onHoverBeacon?: (index: number | null) => void;
  onSelectBeacon?: (beacon: ResearchBeacon) => void;
  mode?: 'grid' | 'synapse' | 'flux';
  onModeChange?: (mode: 'grid' | 'synapse' | 'flux') => void;
}

export default function PlanetMesh({
  activeBeaconIndex = null,
  onHoverBeacon,
  onSelectBeacon,
  mode = 'grid',
  onModeChange,
}: PlanetMeshProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [internalMode, setInternalMode] = useState<'grid' | 'synapse' | 'flux'>(mode);
  const [hoveredBeacon, setHoveredBeacon] = useState<ResearchBeacon | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [telemetry, setTelemetry] = useState({ rotX: 0, rotY: 0, fps: 60 });

  // Sync mode if passed from parent
  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  // Keep latest refs for callbacks to avoid re-binding loops
  const onHoverBeaconRef = useRef(onHoverBeacon);
  onHoverBeaconRef.current = onHoverBeacon;
  const onSelectBeaconRef = useRef(onSelectBeacon);
  onSelectBeaconRef.current = onSelectBeacon;
  const activeIndexRef = useRef(activeBeaconIndex);
  activeIndexRef.current = activeBeaconIndex;
  const modeRef = useRef(internalMode);
  modeRef.current = internalMode;

  const handleModeSwitch = useCallback(
    (newMode: 'grid' | 'synapse' | 'flux') => {
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

    // Rotation & momentum state
    let rotY = 0.65;
    let rotX = -0.28;
    let velX = 0;
    let velY = 0.0018;
    let isPointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let scrollVel = 0;
    let lastScroll = window.scrollY;

    // Click shockwave ripples
    interface Shockwave {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
      color: string;
    }
    const ripples: Shockwave[] = [];

    // Mesh geometry constants
    const LATS = 8;
    const LONS = 16;
    const SEG = 48;

    // Pre-bake glows for ultra-fast rendering
    function makeGlow(rgb: string) {
      const c = document.createElement('canvas');
      c.width = c.height = 40;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(20, 20, 0, 20, 20, 20);
      grad.addColorStop(0, `rgba(${rgb}, 0.95)`);
      grad.addColorStop(0.35, `rgba(${rgb}, 0.4)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 40, 40);
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

    let haloGrad: CanvasGradient | null = null;
    let glassGrad: CanvasGradient | null = null;

    function resize() {
      const r = mount!.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.35;

      // Halo: vibrant cosmic aura
      haloGrad = ctx!.createRadialGradient(w / 2, h / 2, R * 0.4, w / 2, h / 2, R * 1.85);
      haloGrad.addColorStop(0, 'rgba(34, 211, 238, 0.16)');
      haloGrad.addColorStop(0.45, 'rgba(232, 121, 249, 0.08)');
      haloGrad.addColorStop(0.8, 'rgba(16, 41, 78, 0.04)');
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)');

      // Glass globe body: rich depth with specular Fresnel edge
      glassGrad = ctx!.createRadialGradient(
        w / 2 - R * 0.28,
        h / 2 - R * 0.28,
        R * 0.05,
        w / 2,
        h / 2,
        R * 1.05
      );
      glassGrad.addColorStop(0, 'rgba(18, 38, 70, 0.85)');
      glassGrad.addColorStop(0.5, 'rgba(7, 14, 30, 0.9)');
      glassGrad.addColorStop(0.9, 'rgba(3, 7, 18, 0.95)');
      glassGrad.addColorStop(1, 'rgba(34, 211, 238, 0.22)');
    }

    // 3D Spherical Projection with perspective
    function project(lat: number, lon: number, t: number, rippleDisplacement = 0) {
      const wave = Math.sin(t * 1.8 + lat * 2.5 + lon * 1.8) * 0.035;
      const r = R * (1 + wave + rippleDisplacement);
      const x = r * Math.cos(lat) * Math.cos(lon);
      const y = r * Math.sin(lat);
      const z = r * Math.cos(lat) * Math.sin(lon);

      // Rotate around Y (spin + drag + cursor)
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;

      // Rotate around X (pitch + tilt)
      const rx = rotX + tiltX;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      const persp = 1 / (1 + z2 / (R * 4.4));
      return {
        x: w / 2 + (x1 + tiltY * R * 0.25) * persp,
        y: h / 2 + y2 * persp,
        z: z2,
        p: persp,
      };
    }

    // Draw orbital rings
    function drawOrbitRings(t: number) {
      ctx!.save();
      ctx!.translate(w / 2, h / 2);
      ctx!.rotate(0.35);

      // Outer equator ring with dash
      ctx!.beginPath();
      ctx!.ellipse(0, 0, R * 1.38, R * 0.45, -0.22, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(103, 232, 249, 0.25)';
      ctx!.lineWidth = 1.4;
      ctx!.setLineDash([8, 8]);
      ctx!.lineDashOffset = -t * 14;
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Second inclined ring
      ctx!.beginPath();
      ctx!.ellipse(0, 0, R * 1.55, R * 0.32, 0.55, 0, Math.PI * 2);
      ctx!.strokeStyle = 'rgba(232, 121, 249, 0.18)';
      ctx!.lineWidth = 1.2;
      ctx!.setLineDash([4, 12]);
      ctx!.lineDashOffset = t * 18;
      ctx!.stroke();
      ctx!.setLineDash([]);

      ctx!.restore();
    }

    // Main Draw Function
    let nearestBeaconUnderCursor: ResearchBeacon | null = null;
    let hoveredBeaconIdx: number | null = null;

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const curMode = modeRef.current;

      // 1. Cosmic Atmospheric Halo
      if (haloGrad) {
        ctx!.fillStyle = haloGrad;
        ctx!.fillRect(0, 0, w, h);
      }

      // 2. Orbital Rings in background
      drawOrbitRings(t);

      // 3. Volumetric Glass Globe Body
      if (glassGrad) {
        ctx!.fillStyle = glassGrad;
        ctx!.beginPath();
        ctx!.arc(w / 2, h / 2, R * 1.02, 0, Math.PI * 2);
        ctx!.fill();

        // Edge rim glow
        ctx!.strokeStyle = 'rgba(34, 211, 238, 0.35)';
        ctx!.lineWidth = 1.8;
        ctx!.stroke();

        // Inner shadow/depth
        ctx!.strokeStyle = 'rgba(232, 121, 249, 0.16)';
        ctx!.lineWidth = 3.5;
        ctx!.stroke();
      }

      // 4. Render Mode Specific Geometry
      if (curMode === 'grid') {
        // Geodesic Latitude Rings
        for (let i = 1; i <= LATS; i++) {
          const lat = (i / (LATS + 1) - 0.5) * Math.PI;
          ctx!.beginPath();
          for (let sIdx = 0; sIdx <= SEG; sIdx++) {
            const lon = (sIdx / SEG) * Math.PI * 2;
            const p = project(lat, lon, t);
            if (sIdx === 0) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
          }
          ctx!.strokeStyle = 'rgba(34, 211, 238, 0.15)';
          ctx!.lineWidth = 3.8;
          ctx!.stroke();
          ctx!.strokeStyle = 'rgba(224, 242, 254, 0.48)';
          ctx!.lineWidth = 1.3;
          ctx!.stroke();
        }

        // Longitude Lines
        for (let j = 0; j < LONS; j++) {
          const lon = (j / LONS) * Math.PI * 2;
          ctx!.beginPath();
          for (let sIdx = 0; sIdx <= SEG; sIdx++) {
            const lat = (sIdx / SEG - 0.5) * Math.PI;
            const p = project(lat, lon, t);
            if (sIdx === 0) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
          }
          ctx!.strokeStyle = 'rgba(34, 211, 238, 0.15)';
          ctx!.lineWidth = 3.8;
          ctx!.stroke();
          ctx!.strokeStyle = 'rgba(224, 242, 254, 0.48)';
          ctx!.lineWidth = 1.3;
          ctx!.stroke();
        }

        // Grid Intersection Nodes
        for (let i = 1; i <= LATS; i++) {
          const lat = (i / (LATS + 1) - 0.5) * Math.PI;
          for (let j = 0; j < LONS; j++) {
            const lon = (j / LONS) * Math.PI * 2;
            const p = project(lat, lon, t);
            const front = p.z < R * 0.15;
            const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.2 + j * 0.8);
            const isCyan = (i + j) % 2 === 0;
            const alpha = (front ? 0.85 : 0.28) * (0.4 + 0.6 * pulse);
            const rad = (front ? 2.6 : 1.5) * (0.75 + 0.45 * pulse) * p.p;
            const glow = isCyan ? glowCyan : glowMag;
            const gs = rad * (front ? 8 : 5);

            ctx!.globalAlpha = alpha;
            ctx!.drawImage(glow, p.x - gs / 2, p.y - gs / 2, gs, gs);
            ctx!.globalAlpha = 1;
            ctx!.fillStyle = isCyan
              ? `rgba(186, 245, 255, ${Math.min(1, alpha + 0.2)})`
              : `rgba(250, 215, 255, ${Math.min(1, alpha + 0.2)})`;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, rad * 0.65, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      } else if (curMode === 'synapse') {
        // Neural Network / Synaptic Constellation Mode
        const points: { x: number; y: number; z: number; p: number; id: number }[] = [];
        const numNodes = 60;
        for (let k = 0; k < numNodes; k++) {
          const phi = Math.acos(1 - (2 * (k + 0.5)) / numNodes);
          const theta = Math.PI * (1 + Math.sqrt(5)) * k;
          const lat = phi - Math.PI / 2;
          const lon = theta % (Math.PI * 2);
          const p = project(lat, lon, t);
          points.push({ ...p, id: k });
        }

        // Draw connections between close nodes
        for (let a = 0; a < points.length; a++) {
          if (points[a].z > R * 0.4) continue;
          for (let b = a + 1; b < points.length; b++) {
            if (points[b].z > R * 0.4) continue;
            const dx = points[a].x - points[b].x;
            const dy = points[a].y - points[b].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 72) {
              const str = 1 - dist / 72;
              ctx!.beginPath();
              ctx!.moveTo(points[a].x, points[a].y);
              ctx!.lineTo(points[b].x, points[b].y);
              ctx!.strokeStyle = `rgba(34, 211, 238, ${(str * 0.42).toFixed(3)})`;
              ctx!.lineWidth = str * 1.8;
              ctx!.stroke();
            }
          }
        }

        // Synaptic particles
        for (const pt of points) {
          const front = pt.z < R * 0.15;
          const rad = (front ? 3.4 : 1.8) * pt.p;
          const gs = rad * (front ? 9 : 5);
          const glow = pt.id % 3 === 0 ? glowMag : glowCyan;
          ctx!.globalAlpha = front ? 0.9 : 0.35;
          ctx!.drawImage(glow, pt.x - gs / 2, pt.y - gs / 2, gs, gs);
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, rad * 0.65, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      } else {
        // Flux / Data Waves Mode
        for (let ring = 0; ring < 7; ring++) {
          const lat = (ring / 6 - 0.5) * Math.PI * 0.7;
          ctx!.beginPath();
          for (let sIdx = 0; sIdx <= SEG; sIdx++) {
            const lon = (sIdx / SEG) * Math.PI * 2;
            const waveLat = lat + Math.sin(lon * 4 + t * 4 + ring) * 0.08;
            const p = project(waveLat, lon, t);
            if (sIdx === 0) ctx!.moveTo(p.x, p.y);
            else ctx!.lineTo(p.x, p.y);
          }
          ctx!.strokeStyle = ring % 2 === 0 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(232, 121, 249, 0.4)';
          ctx!.lineWidth = 1.8;
          ctx!.stroke();
        }

        // High speed data packets
        for (let pIdx = 0; pIdx < 14; pIdx++) {
          const lon = (t * (0.8 + (pIdx % 3) * 0.4) + (pIdx / 14) * Math.PI * 2) % (Math.PI * 2);
          const lat = Math.sin(lon * 2 + pIdx) * 0.5;
          const p = project(lat, lon, t);
          if (p.z < R * 0.35) {
            const glow = pIdx % 2 === 0 ? glowCyan : glowMag;
            ctx!.drawImage(glow, p.x - 12, p.y - 12, 24, 24);
            ctx!.fillStyle = '#ffffff';
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, 2.8 * p.p, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }

      // 5. High-Velocity Data Pulses travelling the longitudes
      for (let k = 0; k < 4; k++) {
        const lon = ((k * 4 + 1) / LONS) * Math.PI * 2;
        const phase = (t * 0.45 + k * 0.25) % 1;
        const lat = (phase - 0.5) * Math.PI;
        const p = project(lat, lon, t);
        if (p.z < R * 0.35) {
          const glow = k % 2 === 0 ? glowMag : glowCyan;
          ctx!.drawImage(glow, p.x - 16, p.y - 16, 32, 32);
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 3.0 * p.p, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // 6. Interactive Research Beacons (3D Points on the Globe)
      let currentActiveIdx = activeIndexRef.current;
      nearestBeaconUnderCursor = null;
      hoveredBeaconIdx = null;

      RESEARCH_BEACONS.forEach((beacon, idx) => {
        const p = project(beacon.lat, beacon.lon, t);
        const isFacing = p.z < R * 0.25; // on front half of sphere
        const isTargeted = currentActiveIdx === idx;

        // Check mouse distance
        const dx = lastPointerX - p.x;
        const dy = lastPointerY - p.y;
        const dist = Math.hypot(dx, dy);
        const isHovered = isFacing && dist < 24;

        if (isHovered) {
          nearestBeaconUnderCursor = beacon;
          hoveredBeaconIdx = idx;
        }

        const activeHighlight = isTargeted || isHovered;

        if (isFacing) {
          const beaconGlow = glowMap[beacon.rgb] || glowCyan;

          // Animated pulse ring
          const ringPulse = (t * 2.5 + idx * 0.8) % 1;
          const outerR = (10 + ringPulse * 16) * p.p;
          const ringAlpha = (1 - ringPulse) * (activeHighlight ? 0.95 : 0.6);

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, outerR, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${beacon.rgb}, ${ringAlpha.toFixed(3)})`;
          ctx!.lineWidth = activeHighlight ? 2.2 : 1.2;
          ctx!.stroke();

          // Target reticle crosshairs if active
          if (activeHighlight) {
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, 18 * p.p, 0, Math.PI * 2);
            ctx!.strokeStyle = `rgba(${beacon.rgb}, 0.85)`;
            ctx!.lineWidth = 1.5;
            ctx!.setLineDash([3, 3]);
            ctx!.stroke();
            ctx!.setLineDash([]);

            // Reticle ticks
            const tickLen = 6;
            ctx!.strokeStyle = '#ffffff';
            ctx!.lineWidth = 1.5;
            ctx!.beginPath();
            ctx!.moveTo(p.x - 22, p.y); ctx!.lineTo(p.x - 22 + tickLen, p.y);
            ctx!.moveTo(p.x + 22, p.y); ctx!.lineTo(p.x + 22 - tickLen, p.y);
            ctx!.moveTo(p.x, p.y - 22); ctx!.lineTo(p.x, p.y - 22 + tickLen);
            ctx!.moveTo(p.x, p.y + 22); ctx!.lineTo(p.x, p.y + 22 - tickLen);
            ctx!.stroke();
          }

          // Core beacon glow
          const beaconSize = (activeHighlight ? 26 : 18) * p.p;
          ctx!.drawImage(beaconGlow, p.x - beaconSize, p.y - beaconSize, beaconSize * 2, beaconSize * 2);

          // Center solid pip
          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, (activeHighlight ? 4.5 : 3.2) * p.p, 0, Math.PI * 2);
          ctx!.fill();

          // High-tech HUD Label Tag
          ctx!.save();
          ctx!.font = `${activeHighlight ? 'bold 11px' : '10px'} "JetBrains Mono", monospace`;
          const text = `${beacon.tag}: ${beacon.short}`;
          const metrics = ctx!.measureText(text);
          const boxW = metrics.width + 14;
          const boxH = 20;
          const boxX = p.x + 14;
          const boxY = p.y - 10;

          // Callout leader line
          ctx!.beginPath();
          ctx!.moveTo(p.x + (activeHighlight ? 8 : 5), p.y);
          ctx!.lineTo(boxX, p.y);
          ctx!.strokeStyle = `rgba(${beacon.rgb}, ${activeHighlight ? 0.95 : 0.6})`;
          ctx!.lineWidth = 1.2;
          ctx!.stroke();

          // Label box backdrop
          ctx!.fillStyle = activeHighlight
            ? 'rgba(7, 14, 32, 0.92)'
            : 'rgba(7, 14, 32, 0.72)';
          ctx!.strokeStyle = `rgba(${beacon.rgb}, ${activeHighlight ? 0.9 : 0.35})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.roundRect(boxX, boxY, boxW, boxH, 4);
          ctx!.fill();
          ctx!.stroke();

          // Label text
          ctx!.fillStyle = activeHighlight ? '#ffffff' : `rgba(${beacon.rgb}, 0.95)`;
          ctx!.fillText(text, boxX + 7, boxY + 14);
          ctx!.restore();
        } else {
          // Faded back-facing marker
          ctx!.fillStyle = `rgba(${beacon.rgb}, 0.18)`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2.2 * p.p, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      // 7. Click Shockwave Ripples
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rp = ripples[rIdx];
        rp.r += 3.2;
        rp.alpha *= 0.94;
        ctx!.beginPath();
        ctx!.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${rp.color}, ${rp.alpha.toFixed(3)})`;
        ctx!.lineWidth = 2.2;
        ctx!.stroke();
        if (rp.alpha < 0.02 || rp.r > rp.maxR) {
          ripples.splice(rIdx, 1);
        }
      }
    }

    // Animation Loop with Smooth Momentum
    let lastDraw = 0;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    function frame(now: number) {
      if (!running) return;
      if (now - lastDraw < 16) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      const t = now / 1000;

      // Measure FPS occasionally
      frameCount++;
      if (now - lastFpsTime >= 1000) {
        setTelemetry((prev) => ({
          ...prev,
          fps: frameCount,
          rotX: Math.round(rotX * (180 / Math.PI)),
          rotY: Math.round(rotY * (180 / Math.PI)) % 360,
        }));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Scroll speed coupling
      const sc = window.scrollY;
      scrollVel += (sc - lastScroll) * 0.00045;
      lastScroll = sc;
      scrollVel *= 0.92;

      // Inertial spin
      if (!isPointerDown) {
        rotY += velY + scrollVel;
        rotX += velX;
        velY = velY * 0.97 + 0.0018 * 0.03; // decay back to base spin
        velX *= 0.95;
      }

      // Parallax mouse tilt
      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;

      draw(t);

      // Notify parent on hover state change
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

    // Pointer Interactivity (Drag to Rotate + Click)
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
      } else {
        // Subtle tilt when hovering over mount
        const nx = (localX - w / 2) / (w / 2);
        const ny = (localY - h / 2) / (h / 2);
        targetTiltY = Math.max(-1, Math.min(1, nx)) * 0.8;
        targetTiltX = Math.max(-1, Math.min(1, ny)) * 0.25;
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

      // Check if clicked a research beacon
      if (nearestBeaconUnderCursor) {
        onSelectBeaconRef.current?.(nearestBeaconUnderCursor);
        ripples.push({
          x: clickX,
          y: clickY,
          r: 6,
          maxR: 90,
          alpha: 0.9,
          color: nearestBeaconUnderCursor.rgb,
        });
        return;
      }

      // Otherwise generic pulse shockwave
      ripples.push({
        x: clickX,
        y: clickY,
        r: 6,
        maxR: 110,
        alpha: 0.8,
        color: '34, 211, 238',
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
    <div className="planet-stage" ref={mountRef}>
      <div className="planet-mount">
        <canvas
          ref={canvasRef}
          className={`planet-canvas ${isDragging ? 'is-dragging' : ''}`}
          aria-label="Interactive 3D ACM Research Globe. Drag to rotate, click nodes to explore."
        />
      </div>

      {/* Floating Interactive Controls HUD */}
      <div className="planet-hud-panel" aria-hidden="true">
        <div className="planet-mode-selector">
          <button
            type="button"
            className={`mode-btn ${internalMode === 'grid' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('grid')}
            title="Geodesic Wireframe Matrix"
          >
            GRID
          </button>
          <button
            type="button"
            className={`mode-btn ${internalMode === 'synapse' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('synapse')}
            title="Synaptic Neural Network"
          >
            SYNAPSE
          </button>
          <button
            type="button"
            className={`mode-btn ${internalMode === 'flux' ? 'is-active' : ''}`}
            onClick={() => handleModeSwitch('flux')}
            title="Orbital Flux Waves"
          >
            FLUX
          </button>
        </div>

        <div className="planet-telemetry-badge">
          <span className="telemetry-dot" />
          <span className="telemetry-text">
            ROT: {telemetry.rotY}° • PITCH: {telemetry.rotX}°
          </span>
          <span className="drag-hint">[ DRAG TO ORBIT ]</span>
        </div>
      </div>

      {/* Hover Card Overlay */}
      {hoveredBeacon && (
        <div
          className="planet-beacon-tooltip"
          style={{ borderColor: `rgba(${hoveredBeacon.rgb}, 0.6)` }}
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
