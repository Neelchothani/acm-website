'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import createGlobe, { Globe as CobeGlobe } from 'cobe';
import { cn } from '../../lib/utils';

export interface GlobeMarker {
  location: [number, number];
  size: number;
  id?: string;
  color?: [number, number, number];
}

export interface GlobeArc {
  from: [number, number];
  to: [number, number];
  color?: [number, number, number];
}

export interface GlobeProps {
  className?: string;
  phi?: number;
  theta?: number;
  scale?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: GlobeMarker[];
  arcs?: GlobeArc[];
  arcColor?: [number, number, number];
  arcWidth?: number;
  arcHeight?: number;
  opacity?: number;
  onInit?: (globe: CobeGlobe) => void;
}

export interface GlobeRef {
  getCanvas: () => HTMLCanvasElement | null;
  getGlobe: () => CobeGlobe | null;
}

export const Globe = forwardRef<GlobeRef, GlobeProps>(({
  className,
  phi = 0,
  theta = 0.25,
  scale = 1.1,
  dark = 1,
  diffuse = 1.2,
  mapSamples = 36000,
  mapBrightness = 6,
  baseColor = [0.12, 0.22, 0.42], // Deep cyber blue
  markerColor = [0.0, 0.95, 1.0], // Glowing neon cyan
  glowColor = [0.08, 0.45, 0.85],  // Ethereal atmospheric glow
  markers = [],
  arcs = [],
  arcColor = [0.0, 0.85, 1.0],
  arcWidth = 1,
  arcHeight = 0.25,
  opacity = 1,
  onInit,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<CobeGlobe | null>(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getGlobe: () => globeRef.current,
  }));

  // Create globe on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = canvas.offsetWidth || 500;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: Math.round(width * dpr),
      height: Math.round(width * dpr),
      phi,
      theta,
      dark,
      scale,
      diffuse,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      opacity,
      offset: [0, 0],
      markers,
      arcs,
      arcColor,
      arcWidth,
      arcHeight,
    });

    globeRef.current = globe;
    if (onInit) onInit(globe);

    // Ensure Cobe renders the dotted landmass texture once its internal bitmap finishes decoding
    const t1 = window.setTimeout(() => globe.update({ phi, theta }), 60);
    const t2 = window.setTimeout(() => globe.update({ phi, theta }), 180);
    const t3 = window.setTimeout(() => globe.update({ phi, theta }), 400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', onResize);
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  // Update dynamic options when props change
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.update({
        phi,
        theta,
        scale,
        markers,
        arcs,
        arcColor,
        arcWidth,
        arcHeight,
        opacity,
        baseColor,
        markerColor,
        glowColor,
        diffuse,
        dark,
      });
    }
  }, [phi, theta, scale, markers, arcs, arcColor, arcWidth, arcHeight, opacity, baseColor, markerColor, glowColor, diffuse, dark]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-full aspect-square select-none pointer-events-none',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{
          aspectRatio: '1 / 1',
          contain: 'layout paint size',
        }}
      />
    </div>
  );
});

Globe.displayName = 'Globe';
export default Globe;
