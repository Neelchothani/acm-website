import { useMemo } from 'react';
import { GLOBAL_HUBS } from './globalNetworkData';

// Analytical spherical-to-camera projection math matching Cobe WebGL
function latLonToUnitSphere(lat: number, lon: number): [number, number, number] {
  const r = (lat * Math.PI) / 180;
  const a = (lon * Math.PI) / 180 - Math.PI;
  const cosR = Math.cos(r);
  return [-cosR * Math.cos(a), Math.sin(r), cosR * Math.sin(a)];
}

function rotatePoint(
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

interface GlobalNetworkOverlayProps {
  phi: number;
  theta: number;
  globeScale: number;
  scrollProgress: number;
  onTargetLocation?: (lat: number, lon: number) => void;
  pingActive?: boolean;
}

export default function GlobalNetworkOverlay({
  phi,
  theta,
  globeScale,
  scrollProgress,
  onTargetLocation,
  pingActive = false,
}: GlobalNetworkOverlayProps) {
  // Calculate visible hubs on the front hemisphere of the globe
  const visibleHubs = useMemo(() => {
    // Only display interactive hubs during hero stage (< 0.40 scroll)
    if (scrollProgress > 0.35) return [];

    return GLOBAL_HUBS.map((hub) => {
      const unit = latLonToUnitSphere(hub.location[0], hub.location[1]);
      const cam = rotatePoint(unit, phi, theta);
      // cam[2] > 0 means the point faces the camera (front hemisphere)
      const isVisible = cam[2] > 0.12;

      // Map from [-1, 1] normalized coordinates to percentage [0, 100]%
      const radiusFactor = 45 * globeScale;
      const leftPercent = 50 + cam[0] * radiusFactor;
      const topPercent = 50 - cam[1] * radiusFactor;

      // Distance from camera for depth scaling
      const depthScale = Math.max(0.65, Math.min(1.15, cam[2]));

      return {
        ...hub,
        isVisible,
        camZ: cam[2],
        left: leftPercent,
        top: topPercent,
        depthScale,
      };
    }).filter((h) => h.isVisible);
  }, [phi, theta, globeScale, scrollProgress]);

  // If scrolled past hero stage, hide overlay completely
  if (scrollProgress > 0.35) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none">
      {/* Radar Ping Wave radiating from Mumbai if triggered */}
      {pingActive && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[80%] h-[80%] rounded-full border border-cyan-400/40 animate-ping" />
          <div className="w-[50%] h-[50%] rounded-full border border-cyan-300/60 animate-ping [animation-delay:0.2s]" />
          <div className="w-[20%] h-[20%] rounded-full border border-cyan-200/80 animate-ping [animation-delay:0.4s]" />
        </div>
      )}

      {/* Hub Hotspot Pins */}
      {visibleHubs.map((hub) => {
        const isHome = hub.isHome;

        return (
          <div
            key={hub.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
            style={{
              left: `${hub.left}%`,
              top: `${hub.top}%`,
              opacity: Math.max(0.3, Math.min(1, hub.camZ * 1.5)),
              transform: `translate(-50%, -50%) scale(${hub.depthScale})`,
              transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onTargetLocation) {
                onTargetLocation(hub.location[0], hub.location[1]);
              }
            }}
          >
            {/* Beacon Pulse Ring */}
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none ${
                isHome ? 'scale-150' : 'scale-100'
              }`}
              style={{
                backgroundColor: hub.hexColor,
                animationDuration: isHome ? '1.8s' : '3s',
              }}
            />

            {/* Glowing Core Pin */}
            <div
              className={`relative rounded-full flex items-center justify-center transition-all duration-200 ${
                isHome
                  ? 'w-4 h-4 border-2 border-white shadow-[0_0_16px_#00F0FF]'
                  : 'w-2.5 h-2.5 border border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.7)]'
              }`}
              style={{
                backgroundColor: hub.hexColor,
              }}
            >
              {isHome && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </div>

            {/* City Tag */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none opacity-75">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-700/60 backdrop-blur-md text-[9.5px] font-mono tracking-wider text-slate-200 shadow-lg">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: hub.hexColor }}
                />
                <span className="font-semibold">{hub.city}</span>
                {isHome && (
                  <span className="text-[8.5px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    DJSCE
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

