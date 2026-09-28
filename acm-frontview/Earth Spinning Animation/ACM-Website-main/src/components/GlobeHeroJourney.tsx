import { useState, useEffect, useRef, useMemo } from "react";
import Globe from "./ui/globe";
import DynamicAuroraBackground from "./DynamicAuroraBackground";
import MumbaiDotRiseMarker from "./MumbaiDotRiseMarker";
import { MUMBAI_DOT_RISE_CONFIG } from "./mumbaiDotRiseConfig";
import { ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// ORIGINAL CLASSIC CYAN GLOBE THEME (UNCHANGED)
// ---------------------------------------------------------------------------
const OG_GLOBE_THEME = {
  baseColor: [0.10, 0.20, 0.38] as [number, number, number],
  markerColor: [0.0, 1.0, 0.95] as [number, number, number],
  glowColor: [0.08, 0.45, 0.85] as [number, number, number],
  diffuse: 1.25,
  dark: 1,
  mapSamples: 22000,
  mapBrightness: 6,
  scale: 1.12,
};

interface GlobeHeroJourneyProps {
  scrollProgress: number;
  onNavigateSection?: (sectionId: string) => void;
  onResetScroll?: () => void;
}

// Exact analytical phi and theta to center Mumbai at rx = 0, ry = 0, rz = 1
const TARGET_PHI = 3.44114;
const TARGET_THETA = 0.3335;

export default function GlobeHeroJourney({
  scrollProgress,
}: GlobeHeroJourneyProps) {
  // Start near Mumbai so the Dot Rise marker triggers into view on load
  const [ambientPhi, setAmbientPhi] = useState<number>(
    MUMBAI_DOT_RISE_CONFIG.rotation.initialPhiRad
  );
  const ambientPhiRef = useRef<number>(
    MUMBAI_DOT_RISE_CONFIG.rotation.initialPhiRad
  );
  const animFrameRef = useRef<number | null>(null);
  const isDotRiseActiveRef = useRef(false);
  const currentSpeedMultRef = useRef(1.0);
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const currentScroll = scrollProgressRef.current;

      // When at hero top (< 0.008), freely rotate Earth continuously
      if (currentScroll < 0.008) {
        const targetMult =
          !prefersReducedMotion && isDotRiseActiveRef.current
            ? MUMBAI_DOT_RISE_CONFIG.rotation.holdSpeedMultiplier
            : 1.0;
        currentSpeedMultRef.current +=
          (targetMult - currentSpeedMultRef.current) * Math.min(1, delta * 3.5);

        const speed =
          MUMBAI_DOT_RISE_CONFIG.rotation.normalSpeedRadPerSec *
          currentSpeedMultRef.current;
        
        ambientPhiRef.current = (ambientPhiRef.current + speed * delta) % (2 * Math.PI);
        setAmbientPhi(ambientPhiRef.current);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  // Quintic smootherstep easing (C2 continuous: zero velocity & zero acceleration at boundaries)
  const smootherstep = (edge0: number, edge1: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  // Hero Title Block scroll fade & lift (visible at top, disappears smoothly by 0.18)
  const heroHeaderState = useMemo(() => {
    if (scrollProgress <= 0.005) {
      return { opacity: 1, translateY: 0, blur: 0 };
    }
    if (scrollProgress >= 0.18) {
      return { opacity: 0, translateY: -28, blur: 6 };
    }
    const p = smootherstep(0.005, 0.18, scrollProgress);
    return {
      opacity: Math.max(0, 1 - p),
      translateY: -p * 28,
      blur: p * 6,
    };
  }, [scrollProgress]);

  // Subtle vertical offset so the globe sits smoothly beneath the hero title block,
  // then centers cleanly to 0px
  const globeVerticalOffsetPx = useMemo(() => {
    if (scrollProgress <= 0.005) return 34;
    if (scrollProgress >= 0.20) return 0;
    const p = smootherstep(0.005, 0.20, scrollProgress);
    return 34 * (1 - p);
  }, [scrollProgress]);

  // Scroll Down Indicator Opacity (visible at hero top, fades smoothly on scroll)
  const scrollIndicatorOpacity = useMemo(() => {
    if (scrollProgress <= 0.005) return 1;
    if (scrollProgress >= 0.10) return 0;
    const p = smootherstep(0.005, 0.10, scrollProgress);
    return Math.max(0, 1 - p);
  }, [scrollProgress]);

  // ---------------------------------------------------------------------------
  // Stage 1: Centered Globe Rotation Lock onto Mumbai
  // Smoothly blends from continuous free spin to locked TARGET_PHI on Mumbai
  // ---------------------------------------------------------------------------
  const currentPhi = useMemo(() => {
    if (scrollProgress <= 0.005) {
      return ambientPhi;
    }
    if (scrollProgress >= 0.24) {
      return TARGET_PHI;
    }
    const lockWeight = smootherstep(0.005, 0.24, scrollProgress);
    let diff = TARGET_PHI - ambientPhi;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    return ambientPhi + diff * lockWeight;
  }, [scrollProgress, ambientPhi]);

  const currentTheta = useMemo(() => {
    const startTheta = 0.28;
    if (scrollProgress <= 0.005) return startTheta;
    if (scrollProgress >= 0.24) return TARGET_THETA;
    const lockWeight = smootherstep(0.005, 0.24, scrollProgress);
    return startTheta + (TARGET_THETA - startTheta) * lockWeight;
  }, [scrollProgress]);

  // ---------------------------------------------------------------------------
  // Stage 2: Smooth Cinematic Acceleration Dive into Mumbai
  // Range: 0.42 to 0.72
  // ---------------------------------------------------------------------------
  const zoomScale = useMemo(() => {
    if (scrollProgress < 0.42) return 1.0;
    const p = Math.max(0, Math.min(1, (scrollProgress - 0.42) / (0.72 - 0.42)));
    const easedP = p * p * (3 - 2 * p);
    return 1.0 + Math.pow(easedP, 2.8) * 38.0;
  }, [scrollProgress]);

  // Globe visibility and dissolve as it rushes behind the camera
  const globeOpacity = useMemo(() => {
    if (scrollProgress <= 0.54) return 1.0;
    if (scrollProgress >= 0.72) return 0.0;
    const p = smootherstep(0.54, 0.72, scrollProgress);
    return Math.max(0, 1 - p);
  }, [scrollProgress]);

  // Speed warp lines during exponential acceleration into globe
  const showWarpStreaks = scrollProgress >= 0.48 && scrollProgress <= 0.72;

  // Hero background opacity (fades out as camera dives into hyperspace warp tunnel)
  const heroBackgroundOpacity = useMemo(() => {
    if (scrollProgress <= 0.54) return 1;
    if (scrollProgress >= 0.72) return 0;
    const p = smootherstep(0.54, 0.72, scrollProgress);
    return Math.max(0, 1 - p);
  }, [scrollProgress]);

  const handleStartHyperloop = () => {
    window.scrollTo({
      top: window.innerHeight * 0.65,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060913] select-none">
      {/* Background Cyber Grid, Nebula Atmosphere & Dynamic Aurora Lights */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{ opacity: heroBackgroundOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,180,255,0.08)_0%,transparent_65%)]" />
        <div className="city-stars opacity-60" />
        <DynamicAuroraBackground />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Centered 3D Cobe Globe + 3D "Dot Rise" Mumbai Marker (z-10)          */}
      {/* -------------------------------------------------------------------- */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-10 transition-opacity duration-200"
        style={{
          opacity: globeOpacity,
          display: globeOpacity > 0.01 ? "flex" : "none",
          transform: `translate3d(0, ${globeVerticalOffsetPx}px, 0)`,
        }}
      >
        {/* Scalable Container for Hyper-Zoom centered on Mumbai */}
        <div
          className="relative flex items-center justify-center will-change-transform"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Cobe WebGL Globe + Synchronized Three.js "Dot Rise" Overlay */}
          <div className="relative w-[85vw] max-w-[540px] sm:max-w-[620px] md:max-w-[700px] aspect-square flex items-center justify-center">
            <Globe
              phi={currentPhi}
              theta={currentTheta}
              scale={OG_GLOBE_THEME.scale}
              markers={[]}
              dark={OG_GLOBE_THEME.dark}
              diffuse={OG_GLOBE_THEME.diffuse}
              mapSamples={OG_GLOBE_THEME.mapSamples}
              mapBrightness={OG_GLOBE_THEME.mapBrightness}
              baseColor={OG_GLOBE_THEME.baseColor}
              markerColor={OG_GLOBE_THEME.markerColor}
              glowColor={OG_GLOBE_THEME.glowColor}
            />

            <MumbaiDotRiseMarker
              phi={currentPhi}
              theta={currentTheta}
              globeScale={OG_GLOBE_THEME.scale}
              scrollProgress={scrollProgress}
              onHoldStateChange={(holding) => {
                isDotRiseActiveRef.current = holding;
              }}
              onStartHyperloop={handleStartHyperloop}
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Upper-Third Hero Title Block Layered Above Globe Horizon (z-20)      */}
      {/* -------------------------------------------------------------------- */}
      {heroHeaderState.opacity > 0.01 && (
        <header
          className="absolute inset-x-0 top-[2vh] sm:top-[2.5vh] z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8 pointer-events-none select-none w-full"
          style={{
            opacity: heroHeaderState.opacity,
            transform: `translate3d(0, ${heroHeaderState.translateY}px, 0)`,
            filter:
              heroHeaderState.blur > 0.2
                ? `blur(${heroHeaderState.blur.toFixed(1)}px)`
                : undefined,
          }}
        >
          {/* Full-Span Primary Headline: ACM DJSCE */}
          <h1
            className="w-full flex items-center justify-center gap-[3.5vw] font-orbitron font-black whitespace-nowrap leading-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
            style={{
              fontSize: "clamp(2.8rem, 10.8vw, 11.2rem)",
              letterSpacing: "0.05em",
              filter: "drop-shadow(0 0 32px rgba(56, 189, 248, 0.28))",
            }}
          >
            <span
              className="animate-hero-word-1 inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #ffffff 0%, #f0f9ff 45%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
              }}
            >
              ACM
            </span>
            <span
              className="animate-hero-word-2 inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #ffffff 0%, #38bdf8 55%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
              }}
            >
              DJSCE
            </span>
          </h1>
        </header>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Hyper-Zoom Warp Streaks                                              */}
      {/* -------------------------------------------------------------------- */}
      {showWarpStreaks && (
        <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
          <div className="absolute left-[15%] top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-speed-streak" />
          <div className="absolute right-[15%] top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-speed-streak [animation-delay:0.5s]" />
          <div className="absolute left-[50%] top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-speed-streak [animation-delay:0.9s]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,240,255,0.15)_100%)]" />
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Bottom Fixed Scroll Prompt with Gentle Breathing Pulse (z-30)        */}
      {/* -------------------------------------------------------------------- */}
      {scrollIndicatorOpacity > 0 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center cursor-pointer pointer-events-auto transition-all duration-300 group select-none"
          style={{
            opacity: scrollIndicatorOpacity,
            transform: `translateX(-50%) translateY(${(1 - scrollIndicatorOpacity) * 14}px)`,
            pointerEvents: scrollIndicatorOpacity > 0.05 ? "auto" : "none",
          }}
          onClick={handleStartHyperloop}
          title="Scroll down to explore"
        >
          <div className="animate-breathing-pulse flex flex-col items-center gap-2">
            <div className="relative w-5 h-9 rounded-full border-[1.5px] border-slate-400/75 group-hover:border-cyan-400 bg-slate-950/65 backdrop-blur-md flex justify-center pt-1.5 shadow-[0_0_18px_rgba(0,240,255,0.2)] transition-colors duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-mouse-wheel" />
            </div>

            <div className="flex flex-col items-center gap-0.5 font-orbitron">
              <span className="text-[9px] sm:text-[10px] tracking-[0.24em] text-slate-300 group-hover:text-cyan-300 transition-colors uppercase font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                SCROLL TO EXPLORE
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400/85 animate-bounce group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
