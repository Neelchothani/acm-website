import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import HyperspaceHUD from "./HyperspaceHUD";

interface HyperspaceTransitionSceneProps {
  scrollProgress: number; // 0.00 to 1.00 overall
}

export default function HyperspaceTransitionScene({
  scrollProgress,
}: HyperspaceTransitionSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Refs for animation loop
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const prevScrollRef = useRef(scrollProgress);
  const velocityRef = useRef(900);

  // ---------------------------------------------------------------------------
  // Three.js WebGL Starfield Hyperloop Engine
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.0018);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 1500);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x060913, 0);
    container.appendChild(renderer.domElement);

    // 2. Compact Star Streak Particles (1,800 lines across a -640 to +110 tunnel)
    const PARTICLE_COUNT = 1800;
    const positions = new Float32Array(PARTICLE_COUNT * 2 * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 2 * 3);

    interface ParticleData {
      x: number;
      y: number;
      z: number;
      baseLength: number;
      speedMult: number;
      radius: number;
      angle: number;
      colorType: number;
    }

    const particles: ParticleData[] = [];

    const COLOR_PALETTES = [
      {
        head: new THREE.Color(0x00f0ff), // Cyan
        tail: new THREE.Color(0x0044aa),
      },
      {
        head: new THREE.Color(0x70d6ff), // Electric Blue
        tail: new THREE.Color(0x0a2266),
      },
      {
        head: new THREE.Color(0xffffff), // Laser White
        tail: new THREE.Color(0x00a8ff),
      },
      {
        head: new THREE.Color(0xff2a85), // Neon Pink Accent
        tail: new THREE.Color(0x550044),
      },
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 32 + Math.pow(Math.random(), 1.6) * 380;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -640 + Math.random() * 750;

      const rand = Math.random();
      const colorType = rand < 0.65 ? 0 : rand < 0.85 ? 1 : rand < 0.95 ? 2 : 3;

      const pData: ParticleData = {
        x,
        y,
        z,
        baseLength: 4 + Math.random() * 9,
        speedMult: 0.85 + Math.random() * 0.5,
        radius,
        angle,
        colorType,
      };
      particles.push(pData);

      const palette = COLOR_PALETTES[colorType];

      positions[i * 6 + 0] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      colors[i * 6 + 0] = palette.head.r;
      colors[i * 6 + 1] = palette.head.g;
      colors[i * 6 + 2] = palette.head.b;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z + pData.baseLength;
      colors[i * 6 + 3] = palette.tail.r;
      colors[i * 6 + 4] = palette.tail.g;
      colors[i * 6 + 5] = palette.tail.b;
    }

    const streakGeometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(positions, 3);
    posAttribute.setUsage(THREE.DynamicDrawUsage);
    streakGeometry.setAttribute("position", posAttribute);
    streakGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const streakMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 1.5,
    });

    const streakSystem = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(streakSystem);

    // 3. Radial Warp Rings
    const RING_COUNT = 3;
    const RING_SPACING = 185;
    const ringGroup = new THREE.Group();
    const ringMeshes: THREE.Mesh[] = [];

    const ringGeo = new THREE.TorusGeometry(110, 0.7, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    for (let r = 0; r < RING_COUNT; r++) {
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.position.z = -r * RING_SPACING;
      ringMeshes.push(mesh);
      ringGroup.add(mesh);
    }
    scene.add(ringGroup);

    // 4. Continuous Animation Frame Loop (Only draws when in viewport)
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);

      const targetScroll = scrollRef.current;
      if (targetScroll < 0.42) {
        lastTime = time;
        prevScrollRef.current = targetScroll;
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const prevScroll = prevScrollRef.current;
      const scrollDelta = targetScroll - prevScroll;
      prevScrollRef.current = targetScroll;

      const reverse = scrollDelta < -0.0003;

      const isScrollActive = Math.abs(scrollDelta) > 0.0001;
      const scrollSpeed = Math.abs(scrollDelta) / (dt || 0.016);
      const targetVelocity = prefersReducedMotion
        ? 450
        : isScrollActive
        ? 1350 + Math.min(scrollSpeed * 45000, 16000)
        : 950;

      velocityRef.current +=
        (targetVelocity - velocityRef.current) * (isScrollActive ? 0.28 : 0.12);
      const vel = velocityRef.current;

      const streakLength = 3 + (vel / 1000) * 10;
      const effectiveSpeed = vel * dt * 0.46 * (reverse ? -1 : 1);

      const posArr = posAttribute.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        p.z += effectiveSpeed * p.speedMult;

        if (p.z > 110) {
          p.z = -640;
          p.angle = Math.random() * Math.PI * 2;
          p.x = Math.cos(p.angle) * p.radius;
          p.y = Math.sin(p.angle) * p.radius;
        } else if (p.z < -640) {
          p.z = 110;
        }

        p.angle += p.speedMult * 0.05 * dt * (reverse ? -1 : 1);
        p.x = Math.cos(p.angle) * p.radius;
        p.y = Math.sin(p.angle) * p.radius;

        // Head
        posArr[i * 6 + 0] = p.x;
        posArr[i * 6 + 1] = p.y;
        posArr[i * 6 + 2] = p.z;

        // Tail
        const tailOffset = reverse ? -streakLength : streakLength;
        posArr[i * 6 + 3] = p.x;
        posArr[i * 6 + 4] = p.y;
        posArr[i * 6 + 5] = p.z + tailOffset * p.speedMult;
      }

      posAttribute.needsUpdate = true;

      for (let r = 0; r < RING_COUNT; r++) {
        const ring = ringMeshes[r];
        ring.position.z += effectiveSpeed * 0.65;
        if (ring.position.z > 100) {
          ring.position.z = -RING_COUNT * RING_SPACING + 100;
        } else if (ring.position.z < -RING_COUNT * RING_SPACING + 100) {
          ring.position.z = 100;
        }
        ring.rotation.z += 0.18 * dt;
      }

      camera.rotation.z = THREE.MathUtils.lerp(
        camera.rotation.z,
        prefersReducedMotion ? 0 : scrollDelta * 8 + (reverse ? 0.03 : 0),
        0.1
      );

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", handleMotionChange);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      streakGeometry.dispose();
      streakMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Scene fades in smoothly as the globe dive transitions into the hyperloop tunnel
  const sceneOpacity = useMemo(() => {
    if (scrollProgress < 0.5) return 0;
    if (scrollProgress < 0.62) {
      return (scrollProgress - 0.5) / 0.12;
    }
    return 1;
  }, [scrollProgress]);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden transition-opacity duration-300"
      style={{
        opacity: sceneOpacity,
      }}
    >
      {/* Three.js WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 z-10" />

      {/* Minimal Peripheral Vignette Overlay */}
      <HyperspaceHUD scrollProgress={scrollProgress} />
    </div>
  );
}
