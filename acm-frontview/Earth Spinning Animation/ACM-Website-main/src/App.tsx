import { useState, useEffect, useRef } from "react";
import GlobeHeroJourney from "./components/GlobeHeroJourney";
import HyperspaceTransitionScene from "./components/hyperspace/HyperspaceTransitionScene";

export default function App() {
  // Check if ?progress is specified in URL for direct preview/testing
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialParam = searchParams ? searchParams.get("progress") : null;
  const initialProgress =
    initialParam && !isNaN(parseFloat(initialParam))
      ? Math.max(0, Math.min(1, parseFloat(initialParam)))
      : 0;

  const [scrollProgress, setScrollProgress] = useState(initialProgress);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(initialProgress);
  const currentScrollRef = useRef(initialProgress);
  const rafRef = useRef<number | null>(null);
  const hasSignaledComplete = useRef(false);

  // Smooth frame-rate independent scroll dampening across the journey
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, window.scrollY / totalScroll));
      targetScrollRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let lastTime = performance.now();
    const smoothLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Exponential damping: perfectly smooth at 60Hz, 120Hz, 144Hz
      const lambda = 14;
      const factor = 1 - Math.exp(-lambda * dt);
      const diff = targetScrollRef.current - currentScrollRef.current;

      if (Math.abs(diff) > 0.0001) {
        currentScrollRef.current += diff * factor;
        setScrollProgress(currentScrollRef.current);
      } else if (currentScrollRef.current !== targetScrollRef.current) {
        currentScrollRef.current = targetScrollRef.current;
        setScrollProgress(targetScrollRef.current);
      }

      rafRef.current = requestAnimationFrame(smoothLoop);
    };

    rafRef.current = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // When scroll reaches the end, signal the root shell to transition to homepage
  useEffect(() => {
    if (scrollProgress >= 0.98 && !hasSignaledComplete.current) {
      hasSignaledComplete.current = true;
      // Post to parent (root shell) — safe no-op if no parent
      window.parent.postMessage({ type: "frontviewComplete" }, "*");
    }
    // Allow re-triggering if user scrolls back to start then end again
    if (scrollProgress < 0.1) {
      hasSignaledComplete.current = false;
    }
  }, [scrollProgress]);

  // Opacity of the "Enter City" CTA: fades in when warp is nearly complete
  const ctaOpacity =
    scrollProgress > 0.88 ? Math.min(1, (scrollProgress - 0.88) / 0.1) : 0;

  const handleEnterCity = () => {
    window.parent.postMessage({ type: "frontviewComplete" }, "*");
  };

  return (
    <div ref={scrollContainerRef} className="relative w-full h-[185vh] bg-[#060913]">
      {/* Top Subtle Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-slate-800/40">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 transition-all duration-75 shadow-[0_0_8px_#00f0ff]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Sticky Fullscreen Viewport hosting Centered Globe + Hyperloop Warp Tunnel */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#060913]">
        {/* Stage 1: Centered Globe + Exponential Dive Acceleration */}
        <GlobeHeroJourney
          scrollProgress={scrollProgress}
          onResetScroll={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Stage 2: Pure Hyperloop Warp Tunnel */}
        <HyperspaceTransitionScene scrollProgress={scrollProgress} />

        {/* Stage 3: "Enter City" CTA — appears at end of warp */}
        {ctaOpacity > 0 && (
          <button
            onClick={handleEnterCity}
            style={{
              position: "absolute",
              bottom: "3rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              opacity: ctaOpacity,
              pointerEvents: ctaOpacity > 0.1 ? "auto" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              background: "rgba(0, 10, 25, 0.8)",
              border: "1px solid rgba(0, 240, 255, 0.6)",
              color: "#fff",
              padding: "0.9rem 2rem",
              borderRadius: "9999px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              cursor: "pointer",
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 0 24px rgba(0,240,255,0.3), 0 8px 32px rgba(0,0,0,0.8)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "#00f0ff" }}>◈</span>
            ENTER CITY
            <span style={{ color: "#00f0ff" }}>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
