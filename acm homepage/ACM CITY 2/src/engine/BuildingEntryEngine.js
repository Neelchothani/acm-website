/**
 * BuildingEntryEngine — manages cinematic interior fly-through sequences.
 * Features:
 * - Progressive streaming & nearest-frame fallback for instant zero-stutter playback
 * - Seamless cross-fade blend with the active city view on frame 0 (no pop/cut)
 * - Cinematic Ease-In-Out acceleration & deceleration curve
 * - Zero-latency 60fps frame rendering
 */

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export class BuildingEntryEngine {
  constructor(options = {}) {
    this.totalFrames = options.totalFrames || 240;
    this.framesDir = options.framesDir || '/frames_editorial';
    this.canvas = null;
    this.ctx = null;
    this.frames = new Array(this.totalFrames).fill(null);
    this.loadingPromises = new Array(this.totalFrames).fill(null);
    this.isLoaded = false;
    this.currentFrame = 0;
    this.animRaf = null;
    this.isPlaying = false;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d', { alpha: false });
    }
  }

  async preload() {
    if (this.isLoaded) return true;
    try {
      const BATCH = 30;
      for (let start = 0; start < this.totalFrames; start += BATCH) {
        const end = Math.min(start + BATCH, this.totalFrames);
        const promises = [];
        for (let i = start; i < end; i++) {
          promises.push(this._loadFrame(i));
        }
        await Promise.all(promises);
      }
      this.isLoaded = true;
      return true;
    } catch (err) {
      console.warn('[BuildingEntryEngine] Preload failed/deferred:', err);
      return false;
    }
  }

  _loadFrame(idx) {
    if (this.frames[idx]) return Promise.resolve(this.frames[idx]);
    if (this.loadingPromises[idx]) return this.loadingPromises[idx];

    const num = String(idx + 1).padStart(4, '0');
    const url = `${this.framesDir}/f${num}.jpg`;

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img)
          .then((bitmap) => {
            this.frames[idx] = bitmap;
            resolve(bitmap);
          })
          .catch(() => resolve(null));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });

    this.loadingPromises[idx] = promise;
    return promise;
  }

  _findNearestFrame(idx) {
    for (let delta = 1; delta < this.totalFrames; delta++) {
      const left = idx - delta;
      if (left >= 0 && this.frames[left]) return this.frames[left];

      const right = idx + delta;
      if (right < this.totalFrames && this.frames[right]) return this.frames[right];
    }
    return null;
  }

  drawFrame(idx, blendAlpha = 1.0, cityBitmap = null) {
    idx = Math.max(0, Math.min(idx, this.totalFrames - 1));
    this.currentFrame = idx;
    let bitmap = this.frames[idx];
    if (!bitmap) {
      this._loadFrame(idx);
      bitmap = this._findNearestFrame(idx);
    }

    if (!this.canvas || !this.ctx) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const ctx = this.ctx;

    // If we are cross-fading from the city view during initial frames
    if (cityBitmap && blendAlpha < 0.99) {
      // 1. Draw the city frame base
      const cScale = Math.max(cw / cityBitmap.width, ch / cityBitmap.height);
      const csw = cityBitmap.width * cScale;
      const csh = cityBitmap.height * cScale;
      ctx.drawImage(cityBitmap, (cw - csw) / 2, (ch - csh) / 2, csw, csh);

      // 2. Blend the interior entry frame smoothly on top
      if (bitmap && blendAlpha > 0.01) {
        ctx.globalAlpha = blendAlpha;
        const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
        const sw = bitmap.width * scale;
        const sh = bitmap.height * scale;
        ctx.drawImage(bitmap, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
        ctx.globalAlpha = 1.0;
      }
      return;
    }

    // Normal direct draw
    if (!bitmap) return;
    const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
    const sw = bitmap.width * scale;
    const sh = bitmap.height * scale;
    ctx.drawImage(bitmap, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  playForward({ duration = 4500, cityBitmap = null, onFrame, onComplete } = {}) {
    if (this.animRaf) cancelAnimationFrame(this.animRaf);
    this.isPlaying = true;

    // Trigger progressive loading of all frames if not loaded
    this.preload();

    const startTime = performance.now();

    const tick = (now) => {
      if (!this.isPlaying) return;
      const elapsed = now - startTime;
      const linearProgress = Math.min(1, elapsed / duration);

      // Smooth cinematic ease-in-out curve
      const easedProgress = easeInOutQuad(linearProgress);
      const targetFrameIndex = Math.min(
        this.totalFrames - 1,
        Math.round(easedProgress * (this.totalFrames - 1))
      );

      // Crossfade blend during the first 12% of the transition
      const blendAlpha = Math.min(1, linearProgress / 0.12);

      this.drawFrame(targetFrameIndex, blendAlpha, cityBitmap);
      if (onFrame) onFrame(targetFrameIndex, linearProgress);

      if (linearProgress < 1) {
        this.animRaf = requestAnimationFrame(tick);
      } else {
        this.drawFrame(this.totalFrames - 1);
        this.isPlaying = false;
        this.animRaf = null;
        if (onComplete) onComplete();
      }
    };

    this.animRaf = requestAnimationFrame(tick);
  }

  playReverse({ duration = 3500, cityBitmap = null, onFrame, onComplete } = {}) {
    if (this.animRaf) cancelAnimationFrame(this.animRaf);
    this.isPlaying = true;

    const startTime = performance.now();

    const tick = (now) => {
      if (!this.isPlaying) return;
      const elapsed = now - startTime;
      const linearProgress = Math.min(1, elapsed / duration);

      // Smooth easing out of the building
      const easedProgress = 1 - easeInOutQuad(linearProgress);
      const targetFrameIndex = Math.max(
        0,
        Math.round(easedProgress * (this.totalFrames - 1))
      );

      // Crossfade back to city view during the last 15% of exit
      const blendAlpha = linearProgress > 0.85
        ? Math.max(0, (1 - linearProgress) / 0.15)
        : 1.0;

      this.drawFrame(targetFrameIndex, blendAlpha, cityBitmap);
      if (onFrame) onFrame(targetFrameIndex, linearProgress);

      if (linearProgress < 1) {
        this.animRaf = requestAnimationFrame(tick);
      } else {
        this.isPlaying = false;
        this.animRaf = null;
        if (onComplete) onComplete();
      }
    };

    this.animRaf = requestAnimationFrame(tick);
  }

  stop() {
    this.isPlaying = false;
    if (this.animRaf) {
      cancelAnimationFrame(this.animRaf);
      this.animRaf = null;
    }
  }

  destroy() {
    this.stop();
    this.frames.forEach((b) => {
      try {
        b?.close();
      } catch {
        /* ignore */
      }
    });
    this.frames = [];
    this.loadingPromises = [];
    this.isLoaded = false;
  }
}
