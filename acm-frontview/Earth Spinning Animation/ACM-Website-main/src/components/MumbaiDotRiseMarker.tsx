import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MUMBAI_DOT_RISE_CONFIG } from "./mumbaiDotRiseConfig";

interface MumbaiDotRiseMarkerProps {
  /** Current Cobe phi rotation angle (radians) */
  phi: number;
  /** Current Cobe theta tilt angle (radians) */
  theta: number;
  /** Cobe scale factor (matches OG_GLOBE_THEME.scale = 1.12) */
  globeScale: number;
  /** Overall page scroll progress (0.00 to 1.00) */
  scrollProgress: number;
  /** Callback informing parent whether the letters are active so globe rotation slows down */
  onHoldStateChange?: (isHoldingOrRising: boolean) => void;
  /** Callback when the user clicks the floating ACM letters to start the hyperloop journey */
  onStartHyperloop?: () => void;
}

/**
 * Exact Cobe lat/lon to 3D unit sphere conversion (`U([lat, lon])` in cobe).
 */
export function latLonToCobeUnitSphere(
  lat: number,
  lon: number
): [number, number, number] {
  const r = (lat * Math.PI) / 180;
  const a = (lon * Math.PI) / 180 - Math.PI;
  const cosR = Math.cos(r);
  return [-cosR * Math.cos(a), Math.sin(r), cosR * Math.sin(a)];
}

/**
 * Exact Cobe rotation of a 3D point by `(phi, theta)` into camera space
 * (+X right, +Y up, +Z towards camera).
 */
export function rotateCobePoint(
  p: [number, number, number],
  phi: number,
  theta: number
): [number, number, number] {
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  return [
    cosP * p[0] + sinP * p[2],
    sinP * sinT * p[0] + cosT * p[1] - cosP * sinT * p[2],
    -sinP * cosT * p[0] + sinT * p[1] + cosP * cosT * p[2],
  ];
}

interface SampledDotTarget {
  /** Normalized horizontal coordinate across "ACM" (-0.5 to +0.5) */
  u: number;
  /** Normalized vertical coordinate across "ACM" (-0.5 to +0.5) */
  v: number;
  /** Stagger factor [0..1] combining distance from center + random jitter */
  stagger: number;
  /** Unit sphere source coordinate near Mumbai on the globe surface */
  sourceUnit: [number, number, number];
  /** RGB color interpolated from cyan (#5ee7ff) -> blue (#6aa8ff) -> purple (#b48cff) */
  color: [number, number, number];
  /** Random phase for gentle hold twinkling */
  twinklePhase: number;
}

/**
 * Samples "ACM" rendered in Orbitron 900 on an offscreen canvas into target dot coordinates.
 */
function sampleAcmTextTargets(
  isMobile: boolean,
  mumbaiUnit: [number, number, number],
  tangentEast: [number, number, number],
  tangentNorth: [number, number, number]
): SampledDotTarget[] {
  const cfg = MUMBAI_DOT_RISE_CONFIG;
  const W = cfg.sampling.canvasWidth;
  const H = cfg.sampling.canvasHeight;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${cfg.font.weight} ${cfg.font.canvasFontSizePx}px "${cfg.font.family}", ${cfg.font.fallback}`;
  ctx.fillText(cfg.text, W / 2, H / 2 + 4);

  const imgData = ctx.getImageData(0, 0, W, H).data;
  const step = isMobile
    ? cfg.sampling.gridStepMobile
    : cfg.sampling.gridStepDesktop;

  const rawCells: { u: number; v: number }[] = [];
  let minX: number = W;
  let maxX: number = 0;
  let minY: number = H;
  let maxY: number = 0;

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const alpha = imgData[(y * W + x) * 4 + 3];
      if (alpha >= cfg.sampling.alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        rawCells.push({ u: x, v: y });
      }
    }
  }

  if (rawCells.length === 0) return [];

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  // Normalize to [-0.5, +0.5]
  const normalized = rawCells.map((cell) => ({
    u: (cell.u - minX) / spanX - 0.5,
    // Flip Y so +0.5 is top of letters and -0.5 is bottom of letters
    v: 0.5 - (cell.v - minY) / spanY,
  }));

  // Subsample evenly if rawCells exceeds maxParticles
  const maxCount = isMobile
    ? cfg.sampling.maxParticlesMobile
    : cfg.sampling.maxParticlesDesktop;
  let selected = normalized;
  if (normalized.length > maxCount) {
    selected = [];
    const stride = normalized.length / maxCount;
    for (let i = 0; i < maxCount; i++) {
      selected.push(normalized[Math.floor(i * stride)]);
    }
  }

  // Brand gradient colors: cyan (#5ee7ff) -> blue (#6aa8ff) -> purple (#b48cff)
  const cStart = new THREE.Color(cfg.colors.gradientStartHex);
  const cMid = new THREE.Color(cfg.colors.gradientMidHex);
  const cEnd = new THREE.Color(cfg.colors.gradientEndHex);
  const tempColor = new THREE.Color();

  const patchRadius = cfg.spatial.sourcePatchAngularRadiusRad;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return selected.map((pt, idx) => {
    // Left-to-right color interpolation across [0..1]
    const gradT = Math.max(0, Math.min(1, pt.u + 0.5));
    if (gradT < 0.5) {
      tempColor.lerpColors(cStart, cMid, gradT * 2);
    } else {
      tempColor.lerpColors(cMid, cEnd, (gradT - 0.5) * 2);
    }

    // Deterministic source dot position on India's west coast landmass around Mumbai
    const frac = (idx + 0.5) / selected.length;
    const r = Math.sqrt(frac) * patchRadius;
    const thetaAngle = idx * goldenAngle;
    // Inland bias so source dots sit on the Indian peninsula rather than the Arabian Sea
    const dEast = -Math.abs(Math.cos(thetaAngle)) * r * 0.85 - 0.008;
    const dNorth = Math.sin(thetaAngle) * r;

    const sx =
      mumbaiUnit[0] + tangentEast[0] * dEast + tangentNorth[0] * dNorth;
    const sy =
      mumbaiUnit[1] + tangentEast[1] * dEast + tangentNorth[1] * dNorth;
    const sz =
      mumbaiUnit[2] + tangentEast[2] * dEast + tangentNorth[2] * dNorth;
    const sLen = Math.hypot(sx, sy, sz) || 1;

    // Distance from center of "ACM" for staggered launch
    const distFromCenter = Math.min(
      1,
      Math.hypot(pt.u * 1.3, pt.v * 1.6)
    );
    const pseudoRand = Math.abs(Math.sin(idx * 12.9898 + 78.233) % 1);
    const stagger = distFromCenter * 0.62 + pseudoRand * 0.38;

    return {
      u: pt.u,
      v: pt.v,
      stagger,
      sourceUnit: [sx / sLen, sy / sLen, sz / sLen],
      color: [tempColor.r, tempColor.g, tempColor.b],
      twinklePhase: pseudoRand * Math.PI * 2,
    };
  });
}

export default function MumbaiDotRiseMarker({
  phi,
  theta,
  globeScale,
  scrollProgress,
  onHoldStateChange,
  onStartHyperloop,
}: MumbaiDotRiseMarkerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const hitboxRef = useRef<HTMLButtonElement>(null);

  const propsRef = useRef({
    phi,
    theta,
    globeScale,
    scrollProgress,
    onHoldStateChange,
  });
  propsRef.current = {
    phi,
    theta,
    globeScale,
    scrollProgress,
    onHoldStateChange,
  };

  const manualTriggerRef = useRef(false);
  const [isInteractiveVisible, setIsInteractiveVisible] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const cfg = MUMBAI_DOT_RISE_CONFIG;
    const forceSettled =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("settled") === "1";

    // Orthonormal tangent basis on the unit sphere at Mumbai
    const mumbaiUnit = latLonToCobeUnitSphere(
      cfg.location.lat,
      cfg.location.lon
    );
    // East = normalize(up x mumbaiUnit)
    let ex = -mumbaiUnit[2];
    let ey = 0;
    let ez = mumbaiUnit[0];
    const eLen = Math.hypot(ex, ey, ez) || 1;
    ex /= eLen;
    ez /= eLen;
    const tangentEast: [number, number, number] = [ex, ey, ez];
    // North = mumbaiUnit x East
    const tangentNorth: [number, number, number] = [
      mumbaiUnit[1] * ez - mumbaiUnit[2] * ey,
      mumbaiUnit[2] * ex - mumbaiUnit[0] * ez,
      mumbaiUnit[0] * ey - mumbaiUnit[1] * ex,
    ];

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches || forceSettled;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches || forceSettled;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;
    const isMobileInit = window.innerWidth < 768;

    // 1. Three.js Scene & OrthographicCamera matching Cobe's [-1, 1] NDC sphere space
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------------------
    // 2. Always-On Surface Marker (White core dot + Cyan glow + 2 Rippling Rings)
    // -------------------------------------------------------------------------
    const RING_SEGMENTS = 48;
    const createRippleRing = () => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(RING_SEGMENTS * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.colors.surfaceRippleHex),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      return new THREE.LineLoop(geo, mat);
    };

    const rippleRing1 = createRippleRing();
    const rippleRing2 = createRippleRing();
    scene.add(rippleRing1);
    scene.add(rippleRing2);

    // Center Mumbai pinpoint (single 2-vertex THREE.Points: [0] outer cyan glow, [1] bright white core)
    const pinGeo = new THREE.BufferGeometry();
    const pinPositions = new Float32Array(6);
    const pinColors = new Float32Array([
      0.37, 0.91, 1.0, // Cyan halo
      1.0, 1.0, 1.0,   // White core
    ]);
    const pinSizes = new Float32Array([28.0, 11.5]);
    const pinAlphas = new Float32Array([0.8, 1.0]);

    pinGeo.setAttribute("position", new THREE.BufferAttribute(pinPositions, 3));
    pinGeo.setAttribute("color", new THREE.BufferAttribute(pinColors, 3));
    pinGeo.setAttribute("aSize", new THREE.BufferAttribute(pinSizes, 1));
    pinGeo.setAttribute("aAlpha", new THREE.BufferAttribute(pinAlphas, 1));

    // Shared custom Point ShaderMaterial (draws glowing core + soft radial halo in 1 draw call)
    const dpr = Math.min(window.devicePixelRatio || 2, 2);
    const pointShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDpr: { value: dpr },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uDpr;
        void main() {
          vColor = color;
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uDpr;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv) * 2.0;
          if (dist > 1.0 || vAlpha <= 0.005) discard;
          float core = smoothstep(0.64, 0.0, dist);
          float halo = pow(max(0.0, 1.0 - dist), 1.55);
          vec3 finalCol = mix(vColor, vec3(1.0), core * 0.82);
          float alpha = min(1.0, (core * 1.35 + halo * 0.92) * vAlpha);
          gl_FragColor = vec4(finalCol * alpha, alpha);
        }
      `,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const mumbaiPinPoints = new THREE.Points(pinGeo, pointShaderMaterial);
    scene.add(mumbaiPinPoints);

    // -------------------------------------------------------------------------
    // 3. Soft Cyan Light Cone (from Mumbai surface to bottom of "ACM" letters)
    // -------------------------------------------------------------------------
    const coneGeo = new THREE.BufferGeometry();
    // 2 triangles forming a tapered beam (apex at Mumbai, top edge under "ACM")
    const conePositions = new Float32Array(4 * 3);
    const coneAlphas = new Float32Array([0.55, 0.16, 0.16, 0.0]);
    coneGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(conePositions, 3)
    );
    coneGeo.setAttribute("aAlpha", new THREE.BufferAttribute(coneAlphas, 1));
    coneGeo.setIndex([0, 1, 2, 0, 2, 3]);

    const coneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(cfg.colors.lightConeHex) },
        uIntensity: { value: 0.0 },
      },
      vertexShader: `
        attribute float aAlpha;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vAlpha;
        void main() {
          float a = vAlpha * uIntensity;
          if (a <= 0.003) discard;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const lightConeMesh = new THREE.Mesh(coneGeo, coneMaterial);
    scene.add(lightConeMesh);

    // -------------------------------------------------------------------------
    // 4. Surface Mask Points (hides globe dots around Mumbai while in flight)
    //    & Rising "ACM" Particle System (single THREE.Points draw call)
    // -------------------------------------------------------------------------
    let targets: SampledDotTarget[] = sampleAcmTextTargets(
      isMobileInit,
      mumbaiUnit,
      tangentEast,
      tangentNorth
    );

    const MAX_POINTS = 480;
    const particlePositions = new Float32Array(MAX_POINTS * 3);
    const particleColors = new Float32Array(MAX_POINTS * 3);
    const particleSizes = new Float32Array(MAX_POINTS);
    const particleAlphas = new Float32Array(MAX_POINTS);

    const particleGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(particlePositions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(particleColors, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(particleSizes, 1);
    sizeAttr.setUsage(THREE.DynamicDrawUsage);
    const alphaAttr = new THREE.BufferAttribute(particleAlphas, 1);
    alphaAttr.setUsage(THREE.DynamicDrawUsage);

    particleGeo.setAttribute("position", posAttr);
    particleGeo.setAttribute("color", colAttr);
    particleGeo.setAttribute("aSize", sizeAttr);
    particleGeo.setAttribute("aAlpha", alphaAttr);

    const acmParticles = new THREE.Points(particleGeo, pointShaderMaterial);
    scene.add(acmParticles);

    // Surface Mask Points to hide underlying Cobe land dots while lifted
    const maskPositions = new Float32Array(MAX_POINTS * 3);
    const maskAlphas = new Float32Array(MAX_POINTS);
    const maskGeo = new THREE.BufferGeometry();
    const maskPosAttr = new THREE.BufferAttribute(maskPositions, 3);
    maskPosAttr.setUsage(THREE.DynamicDrawUsage);
    const maskAlphaAttr = new THREE.BufferAttribute(maskAlphas, 1);
    maskAlphaAttr.setUsage(THREE.DynamicDrawUsage);
    maskGeo.setAttribute("position", maskPosAttr);
    maskGeo.setAttribute("aAlpha", maskAlphaAttr);

    const maskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(cfg.colors.surfaceMaskHex) },
        uDpr: { value: dpr },
      },
      vertexShader: `
        attribute float aAlpha;
        varying float vAlpha;
        uniform float uDpr;
        void main() {
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.2 * uDpr;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          if (length(uv) > 0.5 || vAlpha <= 0.01) discard;
          gl_FragColor = vec4(uColor, vAlpha * 0.55);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const surfaceMaskPoints = new THREE.Points(maskGeo, maskMaterial);
    scene.add(surfaceMaskPoints);

    const syncTargetColorsAndSizes = (mobile: boolean) => {
      const ptSize = mobile
        ? cfg.spatial.particleSizeMobile
        : cfg.spatial.particleSizeDesktop;
      for (let i = 0; i < MAX_POINTS; i++) {
        if (i < targets.length) {
          particleColors[i * 3 + 0] = targets[i].color[0];
          particleColors[i * 3 + 1] = targets[i].color[1];
          particleColors[i * 3 + 2] = targets[i].color[2];
          particleSizes[i] = ptSize;
        } else {
          particleSizes[i] = 0;
          particleAlphas[i] = 0;
          maskAlphas[i] = 0;
        }
      }
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    };

    syncTargetColorsAndSizes(isMobileInit);

    // Wait for Orbitron font to load, then re-sample "ACM" so glyph geometry is exact
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        const mobileNow = window.innerWidth < 768;
        const refreshed = sampleAcmTextTargets(
          mobileNow,
          mumbaiUnit,
          tangentEast,
          tangentNorth
        );
        if (refreshed.length > 0) {
          targets = refreshed;
          syncTargetColorsAndSizes(mobileNow);
        }
      });
    }

    let phaseElapsed = 0;
    const particleProgress = new Float32Array(MAX_POINTS);
    let lastNotifiedHold = false;

    const cosStartRise = Math.cos(
      (cfg.facingAngles.startRiseAngleDeg * Math.PI) / 180
    );

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);

      const {
        phi: curPhi,
        theta: curTheta,
        globeScale: curScale,
        scrollProgress: curScroll,
        onHoldStateChange: holdCb,
      } = propsRef.current;

      // Pause animation when the globe hero is scrolled off-screen
      if (curScroll >= 0.72) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;
      const elapsedSec = now / 1000;

      // Cobe sphere radius in [-1, 1] NDC coordinates
      const R = 0.8 * curScale;

      // Rotate Mumbai surface normal into camera space
      const mRot = rotateCobePoint(mumbaiUnit, curPhi, curTheta);
      const cosFacingAngle = mRot[2]; // dot(mRot, [0, 0, 1])
      const isVisibleHemisphere = cosFacingAngle > 0.02;

      const mx = mRot[0] * R;
      const my = mRot[1] * R;
      const mz = mRot[2] * R;

      // -----------------------------------------------------------------------
      // A. Update Always-On Surface Pin & Two Rippling Surface Rings
      // -----------------------------------------------------------------------
      if (isVisibleHemisphere) {
        mumbaiPinPoints.visible = true;
        rippleRing1.visible = true;
        rippleRing2.visible = true;

        const limbFade = Math.min(1, (cosFacingAngle - 0.02) / 0.22);

        pinPositions[0] = mx;
        pinPositions[1] = my;
        pinPositions[2] = mz + 0.02;
        pinPositions[3] = mx;
        pinPositions[4] = my;
        pinPositions[5] = mz + 0.03;
        pinAlphas[0] = 0.72 * limbFade;
        pinAlphas[1] = 1.0 * limbFade;
        pinGeo.attributes.position.needsUpdate = true;
        pinGeo.attributes.aAlpha.needsUpdate = true;

        // Update 2 concentric rings lying flat on the globe surface at Mumbai
        const updateRing = (ring: THREE.LineLoop, phaseOffset: number) => {
          const loopP = prefersReducedMotion
            ? phaseOffset
            : ((elapsedSec / cfg.timings.surfaceRipplePeriodSec + phaseOffset) %
                1);
          const angularRadius = 0.015 + loopP * 0.145;
          const posArr = (
            ring.geometry.attributes.position as THREE.BufferAttribute
          ).array as Float32Array;

          for (let s = 0; s < RING_SEGMENTS; s++) {
            const ang = (s / RING_SEGMENTS) * Math.PI * 2;
            const dE = Math.cos(ang) * angularRadius;
            const dN = Math.sin(ang) * angularRadius;
            const ux =
              mumbaiUnit[0] + tangentEast[0] * dE + tangentNorth[0] * dE * 0 + tangentNorth[0] * dN;
            const uy =
              mumbaiUnit[1] + tangentEast[1] * dE + tangentNorth[1] * dN;
            const uz =
              mumbaiUnit[2] + tangentEast[2] * dE + tangentNorth[2] * dN;
            const uLen = Math.hypot(ux, uy, uz) || 1;
            const rotPt = rotateCobePoint(
              [ux / uLen, uy / uLen, uz / uLen],
              curPhi,
              curTheta
            );
            posArr[s * 3 + 0] = rotPt[0] * R * 1.003;
            posArr[s * 3 + 1] = rotPt[1] * R * 1.003;
            posArr[s * 3 + 2] = rotPt[2] * R * 1.003 + 0.01;
          }
          ring.geometry.attributes.position.needsUpdate = true;
          const mat = ring.material as THREE.LineBasicMaterial;
          mat.opacity = Math.sin(loopP * Math.PI) * (1 - loopP * 0.45) * 0.85 * limbFade;
        };

        updateRing(rippleRing1, 0);
        updateRing(rippleRing2, 0.5);
      } else {
        mumbaiPinPoints.visible = false;
        rippleRing1.visible = false;
        rippleRing2.visible = false;
      }

      // -----------------------------------------------------------------------
      // B. Smooth Continuous Scroll-Driven & Time-Assisted Dot Rise
      // -----------------------------------------------------------------------
      const hyperloopDive = curScroll > 0.40;
      const diveFactor = hyperloopDive
        ? Math.max(0, Math.min(1, (curScroll - 0.40) / 0.14))
        : 0;

      // Smooth scroll-driven rise progress from 0.08 to 0.24
      const scrollNorm = Math.max(0, Math.min(1, (curScroll - 0.08) / 0.16));
      const scrollRiseProgress =
        scrollNorm * scrollNorm * scrollNorm * (scrollNorm * (scrollNorm * 6 - 15) + 10);

      // Time-assisted rise for ambient hover/facing triggers at top of hero
      const isFacingForRise =
        isVisibleHemisphere &&
        (cosFacingAngle >= cosStartRise || manualTriggerRef.current);

      if (isFacingForRise && !hyperloopDive && curScroll <= 0.12) {
        phaseElapsed = Math.min(cfg.timings.riseDurationSec, phaseElapsed + dt);
      } else if (!isFacingForRise && curScroll <= 0.06 && !manualTriggerRef.current) {
        phaseElapsed = Math.max(0, phaseElapsed - dt * 1.5);
      }
      const timeRiseProgress = prefersReducedMotion
        ? 1.0
        : Math.min(1, phaseElapsed / cfg.timings.riseDurationSec);

      // Global composite rise progress: seamless blend of scroll and time
      const combinedRise = Math.max(scrollRiseProgress, timeRiseProgress);
      const globalRise = combinedRise * (1 - diveFactor * diveFactor);

      const isActiveHoldOrRise = globalRise > 0.15 && isVisibleHemisphere;
      if (isActiveHoldOrRise !== lastNotifiedHold) {
        lastNotifiedHold = isActiveHoldOrRise;
        if (holdCb) holdCb(isActiveHoldOrRise);
        setIsInteractiveVisible(isActiveHoldOrRise);
      }

      // -----------------------------------------------------------------------
      // C. Compute Floating Target Plane Above Mumbai & Update All Particles
      // -----------------------------------------------------------------------
      // Lift direction combines outward radial normal and screen-up so "ACM"
      // floats above Mumbai on screen at all facing angles
      const liftDirX = mRot[0] * 0.48;
      const liftDirY = mRot[1] * 0.42 + 0.86;
      const liftLen = Math.hypot(liftDirX, liftDirY) || 1;
      const floatDist = R * cfg.spatial.floatHeightRadiusFraction;

      const anchorX = mx + (liftDirX / liftLen) * floatDist;
      const anchorY = my + (liftDirY / liftLen) * floatDist;
      const anchorZ = mz + 0.15;

      const wordW = R * cfg.spatial.letterWidthRadiusFraction;
      const wordH = R * cfg.spatial.letterHeightRadiusFraction;
      const overshoot = R * cfg.spatial.bezierOvershootRadiusFraction;

      const STAGGER_SPAN = 0.32;
      let sumProgress = 0;
      const count = targets.length;

      for (let i = 0; i < count; i++) {
        const tgt = targets[i];

        // 1. Smoothly map global progress with particle stagger
        const pNorm = Math.max(
          0,
          Math.min(1, (globalRise - tgt.stagger * STAGGER_SPAN) / (1 - STAGGER_SPAN))
        );
        const t = prefersReducedMotion ? (globalRise > 0.5 ? 1 : 0) : pNorm;
        particleProgress[i] = t;
        sumProgress += t;

        // 2. Source 3D position on the globe surface around Mumbai
        const sRot = rotateCobePoint(tgt.sourceUnit, curPhi, curTheta);
        const sx = sRot[0] * R;
        const sy = sRot[1] * R;
        const sz = sRot[2] * R;

        maskPositions[i * 3 + 0] = sx;
        maskPositions[i * 3 + 1] = sy;
        maskPositions[i * 3 + 2] = sz + 0.005;
        // Hide the underlying globe dot while the particle is in the air
        maskAlphas[i] =
          isVisibleHemisphere && t > 0.02
            ? Math.min(1, t * 3.5) * 0.92
            : 0;

        if (t <= 0.002 || !isVisibleHemisphere) {
          particleAlphas[i] = 0;
          continue;
        }

        // 3. Target 3D position on the camera-facing plane floating above Mumbai
        const tx = anchorX + tgt.u * wordW;
        const ty = anchorY + tgt.v * wordH;
        const tz = anchorZ;

        // 4. Smooth Quadratic Bézier interpolation
        const cx = sx * 0.28 + tx * 0.72;
        const cy =
          Math.max(sy, ty) + overshoot * (0.65 + (tgt.v + 0.5) * 0.7);
        const cz = tz + 0.08;

        const e = t * t * (3 - 2 * t);
        const oneMinusE = 1 - e;

        const px =
          oneMinusE * oneMinusE * sx +
          2 * oneMinusE * e * cx +
          e * e * tx;
        const py =
          oneMinusE * oneMinusE * sy +
          2 * oneMinusE * e * cy +
          e * e * ty;
        const pz =
          oneMinusE * oneMinusE * sz +
          2 * oneMinusE * e * cz +
          e * e * tz;

        particlePositions[i * 3 + 0] = px;
        particlePositions[i * 3 + 1] = py;
        particlePositions[i * 3 + 2] = pz;

        // Particles brighten as they rise, and gently twinkle while holding
        let twinkle = 1.0;
        if (!prefersReducedMotion && t > 0.85) {
          twinkle =
            0.85 +
            0.15 *
              Math.sin(
                elapsedSec * cfg.timings.twinkleSpeedRadPerSec +
                  tgt.twinklePhase
              );
        }
        particleAlphas[i] = Math.min(1, Math.pow(e, 0.65) * 1.15) * twinkle;
      }

      posAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      maskPosAttr.needsUpdate = true;
      maskAlphaAttr.needsUpdate = true;

      const avgProgress = count > 0 ? sumProgress / count : 0;

      // -----------------------------------------------------------------------
      // D. Update Soft Cyan Light Cone & Subtitle HTML Overlay
      // -----------------------------------------------------------------------
      let coneIntensity = 0;
      if (globalRise > 0.05) {
        const coneNorm = Math.min(1, globalRise);
        coneIntensity =
          coneNorm < 0.65
            ? (coneNorm / 0.65) * 0.90
            : 0.90 - ((coneNorm - 0.65) / 0.35) * 0.55;
      }

      coneMaterial.uniforms.uIntensity.value = isVisibleHemisphere
        ? coneIntensity
        : 0;

      if (coneIntensity > 0.005) {
        const bottomY = anchorY - wordH * 0.62;
        const halfBaseW = wordW * 0.48;
        // Vertex 0: Apex at Mumbai
        conePositions[0] = mx;
        conePositions[1] = my;
        conePositions[2] = mz + 0.04;
        // Vertex 1: Left under "A"
        conePositions[3] = anchorX - halfBaseW;
        conePositions[4] = bottomY;
        conePositions[5] = anchorZ - 0.02;
        // Vertex 2: Center under "C"
        conePositions[6] = anchorX;
        conePositions[7] = bottomY;
        conePositions[8] = anchorZ - 0.02;
        // Vertex 3: Right under "M"
        conePositions[9] = anchorX + halfBaseW;
        conePositions[10] = bottomY;
        conePositions[11] = anchorZ - 0.02;
        coneGeo.attributes.position.needsUpdate = true;
      }

      // Position and fade the "DJSCE · MUMBAI" subtitle & interactive hitbox
      let subtitleOpacity = 0;
      if (avgProgress >= 0.68) {
        subtitleOpacity = Math.min(
          1,
          (avgProgress - 0.68) / (1.0 - 0.68)
        ) * (1 - diveFactor);
      }

      // Convert NDC [-1, 1] to percentage [0%, 100%] on the square globe container
      const subtitleScreenXPercent = ((anchorX + 1) * 0.5) * 100;
      const subtitleScreenYPercent =
        ((1 - (anchorY - wordH * 0.72)) * 0.5) * 100;

      const anchorScreenXPercent = ((anchorX + 1) * 0.5) * 100;
      const anchorScreenYPercent = ((1 - anchorY) * 0.5) * 100;

      if (backdropRef.current) {
        const backdropOpacity = isVisibleHemisphere
          ? Math.min(1, avgProgress * 1.15)
          : 0;
        backdropRef.current.style.opacity = backdropOpacity.toFixed(3);
        backdropRef.current.style.left = `${anchorScreenXPercent}%`;
        backdropRef.current.style.top = `${anchorScreenYPercent}%`;
      }

      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = subtitleOpacity.toFixed(3);
        subtitleRef.current.style.left = `${subtitleScreenXPercent}%`;
        subtitleRef.current.style.top = `${subtitleScreenYPercent}%`;
      }

      if (hitboxRef.current) {
        hitboxRef.current.style.left = `${anchorScreenXPercent}%`;
        hitboxRef.current.style.top = `${anchorScreenYPercent}%`;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 600;
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Pointer hover/tap detection on the globe canvas to trigger rise when Mumbai is visible
    const handlePointerMoveOrDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = 1 - ((e.clientY - rect.top) / rect.height) * 2;

      const { phi: curPhi, theta: curTheta, globeScale: curScale } =
        propsRef.current;
      const R = 0.8 * curScale;
      const mRot = rotateCobePoint(mumbaiUnit, curPhi, curTheta);
      if (mRot[2] <= 0.05) return;

      const dist = Math.hypot(ndcX - mRot[0] * R, ndcY - mRot[1] * R);
      if (dist < 0.18) {
        manualTriggerRef.current = true;
      }
    };

    window.addEventListener("pointermove", handlePointerMoveOrDown, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerMoveOrDown, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMoveOrDown);
      window.removeEventListener("pointerdown", handlePointerMoveOrDown);
      motionQuery.removeEventListener("change", onMotionChange);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      rippleRing1.geometry.dispose();
      (rippleRing1.material as THREE.Material).dispose();
      rippleRing2.geometry.dispose();
      (rippleRing2.material as THREE.Material).dispose();
      pinGeo.dispose();
      coneGeo.dispose();
      coneMaterial.dispose();
      particleGeo.dispose();
      pointShaderMaterial.dispose();
      maskGeo.dispose();
      maskMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20">
      {/* Screen-reader accessible label */}
      <span className="sr-only">{MUMBAI_DOT_RISE_CONFIG.location.a11yLabel}</span>

      {/* Soft ambient contrast halo behind the floating "ACM" particle plane */}
      <div
        ref={backdropRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-52 sm:w-64 h-24 sm:h-28 rounded-full pointer-events-none transition-none will-change-[left,top,opacity]"
        style={{
          opacity: 0,
          left: "50%",
          top: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(4, 9, 22, 0.86) 0%, rgba(4, 9, 22, 0.58) 52%, transparent 82%)",
        }}
      />

      {/* Three.js Single-Draw-Call Particle & Ripple Overlay */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{
          filter: "drop-shadow(0 0 10px rgba(94, 231, 255, 0.55))",
        }}
      />

      {/* Thin Gradient Underline + "DJSCE · MUMBAI" Monospace Subtitle */}
      <div
        ref={subtitleRef}
        className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-none transition-none will-change-[left,top,opacity] z-20"
        style={{ opacity: 0, left: "50%", top: "50%" }}
      >
        <div
          className="w-32 sm:w-40 h-[1.5px] rounded-full mb-1.5"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${MUMBAI_DOT_RISE_CONFIG.colors.gradientStartHex} 20%, ${MUMBAI_DOT_RISE_CONFIG.colors.gradientMidHex} 50%, ${MUMBAI_DOT_RISE_CONFIG.colors.gradientEndHex} 80%, transparent 100%)`,
            boxShadow: "0 0 12px rgba(94, 231, 255, 0.8)",
          }}
        />
        <span
          className="font-mono text-[10px] sm:text-xs tracking-[0.28em] uppercase text-cyan-50 whitespace-nowrap font-semibold"
          style={{
            textShadow:
              "0 0 12px rgba(94, 231, 255, 0.9), 0 2px 6px rgba(0, 0, 0, 0.95)",
          }}
        >
          {MUMBAI_DOT_RISE_CONFIG.subtitle}
        </span>
      </div>

      {/* Interactive Click Hitbox on the Floating "ACM" Letters to Start Hyperloop Journey */}
      {isInteractiveVisible && (
        <button
          ref={hitboxRef}
          type="button"
          aria-label="DJSCE ACM, Mumbai — Click to enter hyperloop journey"
          onClick={() => {
            if (onStartHyperloop) onStartHyperloop();
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-40 h-24 rounded-xl pointer-events-auto cursor-pointer bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 z-30"
          style={{ left: "50%", top: "50%" }}
          title="Click to enter hyperloop"
        />
      )}
    </div>
  );
}
