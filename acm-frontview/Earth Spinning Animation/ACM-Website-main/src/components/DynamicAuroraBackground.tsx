import { useEffect, useRef } from "react";

interface AuroraFlare {
  id: number;
  x: number; // 0.0 to 1.0
  y: number; // 0.0 to 1.0
  radius: number;
  intensity: number;
  targetIntensity: number;
  colorType: number; // 0: Cyan (Tech), 1: Pink (Marketing), 2: Purple (Creatives), 3: Emerald (Editorial), 4: Quad Blend
  age: number;
  lifeSpan: number;
}

export default function DynamicAuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: false,
      }) as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("WebGL not supported for Aurora background");
      return;
    }

    const glContext = gl;

    // Vertex Shader: Fullscreen Quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fast procedural 2D Simplex Noise & 2-Octave FBM
    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_time;
      
      #define MAX_FLARES 6
      uniform vec4 u_flares[MAX_FLARES];
      uniform float u_flare_colors[MAX_FLARES];

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float v = 0.55 * snoise(p);
        p = p * 2.05 + vec2(1.6, 3.2);
        v += 0.30 * snoise(p);
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = uv;
        p.x *= aspect;

        float t = u_time * 0.15;

        // The 4 Committee Palette Colors
        vec3 colCyan    = vec3(0.0, 0.95, 1.0);   // Technical (#00f0ff)
        vec3 colPink    = vec3(1.0, 0.06, 0.54);  // Marketing (#ff007f)
        vec3 colPurple  = vec3(0.66, 0.33, 0.97); // Creatives (#a855f7)
        vec3 colEmerald = vec3(0.06, 0.76, 0.52); // Editorial (#10b981)

        float centerLeft  = smoothstep(0.75, 0.05, uv.x) * (0.60 + 0.40 * uv.y);
        float bottomLeft  = smoothstep(0.60, 0.04, uv.x) * smoothstep(0.30, 0.95, uv.y) * 1.35;
        float globeShimmer = smoothstep(0.35, 0.88, uv.x) * smoothstep(0.08, 0.65, uv.y) * 1.15;
        float spatialWeight = max(centerLeft, max(bottomLeft, globeShimmer));

        float rayFilaments = snoise(vec2(p.x * 9.0 + t * 0.25, p.y * 1.4)) * 0.25 + 0.75;

        // Ribbon 1
        float waveY1 = 0.62 + sin(p.x * 2.2 + t * 0.45) * 0.18 + fbm(vec2(p.x * 1.5 + t * 0.2, t * 0.3)) * 0.14;
        float curtain1 = exp(-abs(p.y - waveY1) * 3.8) * rayFilaments;
        vec3 colorCurtain1 = mix(colEmerald, colCyan, clamp(sin(p.x * 2.8 + t * 0.8) * 0.5 + 0.5, 0.0, 1.0));

        // Ribbon 2
        float waveY2 = 0.46 + cos(p.x * 2.8 - t * 0.35) * 0.20 + fbm(vec2(p.x * 1.8 - t * 0.25, p.y + t * 0.2)) * 0.16;
        float curtain2 = exp(-abs(p.y - waveY2) * 3.5) * rayFilaments;
        vec3 colorCurtain2 = mix(colPink, colPurple, clamp(cos(p.x * 2.4 - t * 0.5) * 0.5 + 0.5, 0.0, 1.0));

        // Ribbon 3
        float waveY3 = 0.32 + sin(p.x * 1.8 - p.y * 1.2 + t * 0.5) * 0.22;
        float curtain3 = exp(-abs(p.y - waveY3) * 3.2) * rayFilaments;
        vec3 colorCurtain3 = mix(colPurple, colCyan, clamp(sin(p.y * 3.8 + t * 0.6) * 0.5 + 0.5, 0.0, 1.0));

        vec3 ambientAurora = (
          colorCurtain1 * curtain1 * 0.55 +
          colorCurtain2 * curtain2 * 0.55 +
          colorCurtain3 * curtain3 * 0.45
        ) * spatialWeight;

        float ambientAlpha = (curtain1 * 0.45 + curtain2 * 0.45 + curtain3 * 0.38) * spatialWeight;

        // Flares
        vec3 flareAccum = vec3(0.0);
        float flareAlphaAccum = 0.0;

        for (int i = 0; i < MAX_FLARES; i++) {
          vec4 flare = u_flares[i];
          float fType = u_flare_colors[i];
          
          if (flare.w > 0.005) {
            vec2 fCenter = vec2(flare.x * aspect, flare.y);
            vec2 dVec = p - fCenter;
            float d = length(dVec);
            float radius = flare.z;
            
            float falloff = smoothstep(radius, 0.0, d);
            float flareIntensity = falloff * falloff * flare.w * (0.7 + 0.3 * rayFilaments);

            vec3 fCol = fType < 0.5 ? colCyan : (fType < 1.5 ? colPink : (fType < 2.5 ? colPurple : colEmerald));
            flareAccum += fCol * flareIntensity;
            flareAlphaAccum += flareIntensity * 0.65;
          }
        }

        vec3 finalColor = ambientAurora + flareAccum;
        float finalAlpha = clamp(ambientAlpha + flareAlphaAccum, 0.0, 0.85);
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `;

    // Compile helper
    function compileShader(targetGl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
      const shader = targetGl.createShader(type);
      if (!shader) return null;
      targetGl.shaderSource(shader, source);
      targetGl.compileShader(shader);
      if (!targetGl.getShaderParameter(shader, targetGl.COMPILE_STATUS)) {
        console.error("Shader compile error:", targetGl.getShaderInfoLog(shader));
        targetGl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(glContext, glContext.VERTEX_SHADER, vsSource);
    const fs = compileShader(glContext, glContext.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = glContext.createProgram();
    if (!program) return;
    glContext.attachShader(program, vs);
    glContext.attachShader(program, fs);
    glContext.linkProgram(program);

    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
      console.error("Program link error:", glContext.getProgramInfoLog(program));
      return;
    }

    glContext.useProgram(program);

    // Quad Geometry
    const quadBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, quadBuffer);
    glContext.bufferData(
      glContext.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      glContext.STATIC_DRAW
    );

    const aPos = glContext.getAttribLocation(program, "a_position");
    glContext.enableVertexAttribArray(aPos);
    glContext.vertexAttribPointer(aPos, 2, glContext.FLOAT, false, 0, 0);

    // Uniform Locations
    const uResolution = glContext.getUniformLocation(program, "u_resolution");
    const uTime = glContext.getUniformLocation(program, "u_time");

    const uFlaresLoc: WebGLUniformLocation[] = [];
    const uFlareColorsLoc: WebGLUniformLocation[] = [];
    for (let i = 0; i < 6; i++) {
      uFlaresLoc.push(glContext.getUniformLocation(program, `u_flares[${i}]`)!);
      uFlareColorsLoc.push(glContext.getUniformLocation(program, `u_flare_colors[${i}]`)!);
    }

    // Enable Additive Blending for luminous atmospheric glow
    glContext.enable(glContext.BLEND);
    glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE);

    // Render at optimal half-resolution for atmospheric background
    const updateSize = () => {
      const clientW = canvas.clientWidth || window.innerWidth || 1280;
      const clientH = canvas.clientHeight || window.innerHeight || 720;
      const displayWidth = Math.min(640, Math.floor(clientW * 0.5));
      const displayHeight = Math.min(360, Math.floor(clientH * 0.5));

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        glContext.viewport(0, 0, displayWidth, displayHeight);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // -------------------------------------------------------------------------
    // Stochastic Non-Periodic Flare Engine
    // -------------------------------------------------------------------------
    const MAX_FLARES = 6;
    const flares: AuroraFlare[] = [];
    let nextFlareId = 1;

    function spawnRandomFlare(initialProgress = 0.0, preferredColorType?: number) {
      if (flares.length >= MAX_FLARES) return;

      const zoneRand = Math.random();
      let x = 0.25;
      let y = 0.5;

      if (zoneRand < 0.40) {
        // Center-Left open area (behind Technical / Marketing / Creatives / Editorial)
        x = 0.12 + Math.random() * 0.32;
        y = 0.24 + Math.random() * 0.46;
      } else if (zoneRand < 0.68) {
        // Bottom-Left open cosmic space
        x = 0.08 + Math.random() * 0.35;
        y = 0.55 + Math.random() * 0.35;
      } else if (zoneRand < 0.90) {
        // Shimmering behind the circuit-board globe and holographic rings
        x = 0.62 + Math.random() * 0.32;
        y = 0.20 + Math.random() * 0.58;
      } else {
        // Central ethereal bridge
        x = 0.36 + Math.random() * 0.26;
        y = 0.30 + Math.random() * 0.44;
      }

      // Non-periodic randomized lifespan: 6 to 14 seconds
      const lifeSpan = 6.0 + Math.random() * 8.0;
      const targetIntensity = 0.55 + Math.random() * 0.35;
      const radius = 0.42 + Math.random() * 0.38;

      // Color distribution:
      // 0: Cyan (25%), 1: Pink (25%), 2: Purple (25%), 3: Emerald (20%), 4: Quad Blend (5%)
      let colorType: number;
      if (preferredColorType !== undefined) {
        colorType = preferredColorType;
      } else {
        const cRand = Math.random();
        colorType =
          cRand < 0.25 ? 0 :
          cRand < 0.50 ? 1 :
          cRand < 0.75 ? 2 :
          cRand < 0.92 ? 3 : 4;
      }

      flares.push({
        id: nextFlareId++,
        x,
        y,
        radius,
        intensity: targetIntensity * Math.sin(initialProgress * Math.PI),
        targetIntensity,
        colorType,
        age: initialProgress * lifeSpan,
        lifeSpan,
      });
    }

    // Pre-seed with all 4 committee colors on initial load
    spawnRandomFlare(0.50, 0); // Active Technical Cyan
    spawnRandomFlare(0.60, 1); // Active Marketing Pink
    spawnRandomFlare(0.40, 2); // Active Creatives Purple
    spawnRandomFlare(0.45, 3); // Active Editorial Emerald behind globe

    // Stochastic dynamic scheduling (Poisson / Burst Cluster engine)
    let isBurstMode = false;
    let burstRemaining = 0;
    let timerId: number | null = null;

    function scheduleNextFlareEvent() {
      // Dynamic occurrence rate: sometimes quiet, sometimes rapid cluster
      if (!isBurstMode && Math.random() < 0.42) {
        isBurstMode = true;
        burstRemaining = 2 + Math.floor(Math.random() * 3); // 2 to 4 rapid cluster flares
      }

      let delayMs: number;
      if (isBurstMode) {
        // Fast cluster interval: 650ms - 1900ms
        delayMs = 650 + Math.random() * 1250;
        burstRemaining--;
        if (burstRemaining <= 0) {
          isBurstMode = false;
        }
      } else {
        // Quiet non-interval lull: 3.5s - 8.5s
        delayMs = 3500 + Math.random() * 5000;
      }

      timerId = window.setTimeout(() => {
        spawnRandomFlare(0.0);
        scheduleNextFlareEvent();
      }, delayMs);
    }

    scheduleNextFlareEvent();

    // -------------------------------------------------------------------------
    // Animation Render Loop
    // -------------------------------------------------------------------------
    let animId: number;
    let startTime = performance.now();
    let lastFrameTime = startTime;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;
      const elapsedTime = (now - startTime) / 1000;

      // Update flares lifecycle
      for (let i = flares.length - 1; i >= 0; i--) {
        const flare = flares[i];
        flare.age += dt;

        const progress = flare.age / flare.lifeSpan;
        if (progress >= 1.0) {
          flares.splice(i, 1);
          continue;
        }

        // Smooth sinusoidal breathing envelope
        const envelope = Math.sin(progress * Math.PI);
        flare.intensity = flare.targetIntensity * Math.pow(envelope, 1.4);

        // Gentle organic drift
        flare.x += Math.sin(elapsedTime * 0.35 + flare.id) * 0.006 * dt;
        flare.y -= 0.004 * dt;
      }

      // Draw Shader
      glContext.useProgram(program);
      glContext.uniform2f(uResolution, canvas.width, canvas.height);
      glContext.uniform1f(uTime, elapsedTime);

      // Send active flares to shader uniforms
      for (let i = 0; i < MAX_FLARES; i++) {
        if (i < flares.length) {
          const f = flares[i];
          glContext.uniform4f(uFlaresLoc[i], f.x, f.y, f.radius, f.intensity);
          glContext.uniform1f(uFlareColorsLoc[i], f.colorType);
        } else {
          glContext.uniform4f(uFlaresLoc[i], 0, 0, 0, 0);
          glContext.uniform1f(uFlareColorsLoc[i], 0);
        }
      }

      glContext.drawArrays(glContext.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (timerId) clearTimeout(timerId);
      window.removeEventListener("resize", updateSize);
      glContext.deleteBuffer(quadBuffer);
      glContext.deleteProgram(program);
      glContext.deleteShader(vs);
      glContext.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none opacity-90 transition-opacity duration-1000 mix-blend-screen"
    />
  );
}
