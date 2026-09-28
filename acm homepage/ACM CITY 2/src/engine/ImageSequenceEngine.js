/**
 * High-Performance Progressive ImageSequenceEngine
 * - Fast Startup: Resolves after preloading an initial buffer (~20 frames), opening the city in < 1s.
 * - Adaptive Background Streaming: Streams remaining frames in the background via concurrency pool.
 * - Zero-Blank Fallback: If user scrolls faster than network, seamlessly displays the nearest loaded frame.
 * - Scroll-Aware Prioritization: Prioritizes frames near the user's current scroll position.
 */

export class ImageSequenceEngine {
  constructor(options = {}) {
    this.totalFrames = options.totalFrames || 840;
    this.framesDir = options.framesDir || '/frames';
    this.initialThreshold = options.initialThreshold || 25; // Instant boot threshold
    this.concurrency = options.concurrency || 8;
    this.onProgress = options.onProgress || (() => {});
    this.onError = options.onError || ((e) => console.error(e));

    this.frames = new Array(this.totalFrames).fill(null);
    this.loadingPromises = new Array(this.totalFrames).fill(null);
    this.loadedCount = 0;
    this.canvas = null;
    this.ctx = null;
    this.lastDrawnIdx = -1;
    this.isDestroyed = false;
    this.isBackgroundLoading = false;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  async init() {
    try {
      // Step 1: Rapidly load the initial buffer (frame 0 to initialThreshold)
      const initialCount = Math.min(this.initialThreshold, this.totalFrames);
      const initialPromises = [];

      for (let i = 0; i < initialCount; i++) {
        initialPromises.push(
          this._loadFrame(i).then((bitmap) => {
            if (i === 0 && bitmap) {
              this._draw(bitmap);
            }
            this.onProgress({
              stage: 'loading',
              progress: this.loadedCount / initialCount
            });
          })
        );
      }

      await Promise.all(initialPromises);

      // Step 2: Kick off background streaming for the remaining frames without blocking
      this._startBackgroundStreaming();

      return true;
    } catch (err) {
      console.error('[ImageSequenceEngine] Initial load error:', err);
      this.onError(err);
      return false;
    }
  }

  _startBackgroundStreaming() {
    if (this.isBackgroundLoading || this.isDestroyed) return;
    this.isBackgroundLoading = true;

    const queue = [];
    for (let i = this.initialThreshold; i < this.totalFrames; i++) {
      if (!this.frames[i]) queue.push(i);
    }

    let activeWorkers = 0;
    const maxWorkers = this.concurrency;

    const next = () => {
      if (this.isDestroyed || queue.length === 0) {
        if (activeWorkers === 0) {
          this.isBackgroundLoading = false;
        }
        return;
      }

      while (activeWorkers < maxWorkers && queue.length > 0) {
        const idx = queue.shift();
        if (this.frames[idx]) continue;

        activeWorkers++;
        this._loadFrame(idx)
          .then(() => {
            activeWorkers--;
            next();
          })
          .catch(() => {
            activeWorkers--;
            next();
          });
      }
    };

    next();
  }

  _loadFrame(idx) {
    if (this.frames[idx]) return Promise.resolve(this.frames[idx]);
    if (this.loadingPromises[idx]) return this.loadingPromises[idx];

    const num = String(idx + 1).padStart(4, '0');
    const url = `${this.framesDir}/f${num}.jpg`;

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (this.isDestroyed) {
          resolve(null);
          return;
        }
        createImageBitmap(img)
          .then((bitmap) => {
            this.frames[idx] = bitmap;
            this.loadedCount++;
            resolve(bitmap);
          })
          .catch(reject);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });

    this.loadingPromises[idx] = promise;
    return promise;
  }

  /**
   * Called on scroll — zero stutter.
   * If exact frame is ready, renders immediately.
   * Otherwise renders nearest loaded frame and prioritizes loading requested frame.
   */
  requestFrame(idx) {
    if (this.isDestroyed) return;
    idx = Math.max(0, Math.min(idx, this.totalFrames - 1));

    const exactBitmap = this.frames[idx];
    if (exactBitmap) {
      if (idx !== this.lastDrawnIdx) {
        this._draw(exactBitmap);
        this.lastDrawnIdx = idx;
      }
      return;
    }

    // Urgent load for this frame and close vicinity
    this._prioritizeVicinity(idx);

    // Render closest loaded frame so viewport is never blank
    const fallbackBitmap = this._findNearestFrame(idx);
    if (fallbackBitmap) {
      this._draw(fallbackBitmap);
    }
  }

  _prioritizeVicinity(centerIdx) {
    const range = 5;
    const start = Math.max(0, centerIdx - range);
    const end = Math.min(this.totalFrames - 1, centerIdx + range);

    for (let i = start; i <= end; i++) {
      if (!this.frames[i] && !this.loadingPromises[i]) {
        this._loadFrame(i).then((bitmap) => {
          if (bitmap && Math.abs(this.lastDrawnIdx - i) <= 1) {
            this.requestFrame(i);
          }
        });
      }
    }
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

  _draw(bitmap) {
    const { canvas, ctx } = this;
    if (!canvas || !ctx || !bitmap) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
    const sw = bitmap.width * scale;
    const sh = bitmap.height * scale;
    ctx.drawImage(bitmap, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  getBitmap(idx) {
    if (this.frames[idx]) return this.frames[idx];
    return this._findNearestFrame(idx);
  }

  destroy() {
    this.isDestroyed = true;
    this.frames.forEach((b) => {
      try {
        b?.close();
      } catch {
        /* ignore */
      }
    });
    this.frames = [];
    this.loadingPromises = [];
  }
}
