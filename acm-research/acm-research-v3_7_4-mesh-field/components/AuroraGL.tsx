'use client';

import { useEffect, useRef } from 'react';

// AuroraGL - hyper-realistic live aurora borealis on a raw WebGL fragment
// shader. Domain-warped fbm noise forms soft vertical curtain rays with
// wavy hems; color ramps from a magenta fringe through cyan to green-teal.
// Star field with twinkle, subtle cursor drift, gentle vignette. Runs at
// full resolution for smooth 60fps flow (DPR capped), pauses off-screen,
// renders a single still frame under reduced motion. No libs, no footage.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 auroraColor(float y) {
  vec3 magenta = vec3(0.91, 0.36, 0.98);
  vec3 cyan = vec3(0.13, 0.83, 0.93);
  vec3 teal = vec3(0.16, 0.94, 0.62);
  vec3 col = mix(magenta, cyan, smoothstep(0.0, 0.45, y));
  col = mix(col, teal, smoothstep(0.45, 1.0, y));
  return col;
}

float curtain(vec2 uv, float t, float seed, float freq, float speed) {
  float w1 = fbm(vec2(uv.x * 1.4 + seed * 7.0, t * 0.05 + seed));
  float w2 = noise(vec2(uv.x * 3.0 - seed * 3.0, t * 0.08));
  float x = uv.x * freq + w1 * 2.2 + w2 * 0.9 + t * speed;
  float rays = fbm(vec2(x, seed * 10.0));
  rays = pow(max(rays, 0.0), 1.7) * 1.6;
  float body = fbm(vec2(uv.x * 2.0 + w1 * 1.5 + seed * 4.0, uv.y * 1.2 - t * 0.03)) * 0.45;
  float env = smoothstep(0.05, 0.3, uv.y) * (1.0 - smoothstep(0.5, 1.15, uv.y));
  float hemline = 0.08 + 0.1 * noise(vec2(uv.x * 2.0 + seed * 5.0, t * 0.06));
  float hem = smoothstep(0.0, 0.22, uv.y - hemline);
  return (rays + body) * env * hem;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec3 col = mix(vec3(0.008, 0.012, 0.03), vec3(0.012, 0.03, 0.06), pow(uv.y, 1.4));

  // star field
  vec2 sp = uv * vec2(uRes.x / uRes.y, 1.0) * 90.0;
  vec2 id = floor(sp);
  vec2 fr = fract(sp);
  float h = hash(id);
  if (h > 0.995) {
    vec2 off = vec2(hash(id + 1.3), hash(id + 2.7));
    float d = length(fr - off);
    float tw = 0.55 + 0.45 * sin(uTime * (0.6 + h * 2.0) + h * 50.0);
    col += vec3(0.75, 0.85, 1.0) * (1.0 - smoothstep(0.0, 0.06, d)) * tw * 0.8;
  }

  // subtle cursor drift
  float mInfluence = exp(-pow((uv.x - uMouse.x) * 3.0, 2.0)) * 0.35;
  float t = uTime * 0.55 + mInfluence * 2.0;

  float a1 = curtain(uv + vec2(0.0, 0.05), t, 0.0, 9.0, 0.045);
  float a2 = curtain(uv + vec2(0.35, 0.12), t * 1.15, 4.7, 13.0, -0.03);
  float a3 = curtain(uv + vec2(0.7, 0.2), t * 0.85, 9.3, 6.5, 0.06);
  float a = a1 * 0.9 + a2 * 0.65 + a3 * 0.6;

  vec3 acol = auroraColor(clamp(uv.y * 1.3 - 0.1, 0.0, 1.0));
  col += acol * a * 1.05;
  col += acol * a * a * 0.4;

  float vig = 1.0 - smoothstep(0.45, 1.25, length(uv - vec2(0.5, 0.45)));
  col *= mix(0.75, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function AuroraGL({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      canvas.style.background =
        'linear-gradient(180deg, #02040a 0%, #0a2740 55%, #123a2e 100%)';
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type)!;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      return sh;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    const mouse = { x: 0.5, tx: 0.5 };
    let raf = 0;
    let running = false;
    let start = 0;

    // Adaptive render scale: the aurora is soft gradient noise, so the
    // canvas renders at a fraction of display size and CSS upscales it
    // (invisible for this content). Frame-time EMA steps quality down on
    // weak GPUs and back up when there is headroom.
    const SCALES = [0.75, 0.62, 0.5, 0.4, 0.33];
    let si = 1;
    let ema = 16;
    let lastNow = 0;
    let sinceAdjust = 0;

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALES[si];
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    function draw(t: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uMouse, mouse.x, 0.5);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      if (!running) return;
      if (lastNow) {
        const dt = Math.min(now - lastNow, 250);
        ema = ema * 0.92 + dt * 0.08;
        sinceAdjust++;
        if (sinceAdjust > 45) {
          if (ema > 20 && si < SCALES.length - 1) { si++; resize(); sinceAdjust = 0; }
          else if (ema < 11 && si > 0) { si--; resize(); sinceAdjust = 0; }
        }
      }
      lastNow = now;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (running || reduced) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    draw(2.0); // first paint / reduced-motion still
    if (!reduced) play();

    const ro = new ResizeObserver(() => {
      resize();
      draw(2.0);
    });
    ro.observe(canvas.parentElement!);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.02 }
    );
    io.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    };
    canvas.parentElement!.addEventListener('mousemove', onMove);

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      canvas.parentElement?.removeEventListener('mousemove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
