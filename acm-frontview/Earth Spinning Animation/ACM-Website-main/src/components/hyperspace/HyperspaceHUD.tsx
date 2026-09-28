import { useMemo } from "react";

interface HyperspaceHUDProps {
  scrollProgress: number; // 0.00 to 1.00 overall
}

export default function HyperspaceHUD({
  scrollProgress,
}: HyperspaceHUDProps) {
  // Hyperloop active range: fades in at 0.54 to 0.64 and stays active through 1.00
  const hudOpacity = useMemo(() => {
    if (scrollProgress < 0.54) return 0;
    if (scrollProgress < 0.64) {
      return (scrollProgress - 0.54) / 0.1;
    }
    return 1;
  }, [scrollProgress]);

  if (hudOpacity <= 0.01) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 select-none transition-opacity duration-300 overflow-hidden"
      style={{ opacity: hudOpacity }}
    >
      {/* Subtle Peripheral Cyber Vignette Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(6,9,19,0.75)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#060913]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#060913]/80 to-transparent" />
    </div>
  );
}
