import { MP4Demuxer } from './MP4Demuxer.js';
import { FrameCache } from './FrameCache.js';
import { ENGINE_CONFIG } from '../config/cityTimeline.js';

export class WebCodecsFrameEngine {
  constructor(options = {}) {
    this.videoUrl = options.videoUrl || ENGINE_CONFIG.videoPath;
    this.maxCacheSize = options.maxCacheSize || ENGINE_CONFIG.maxCachedFrames;
    this.prefetchCount = options.prefetchForwardCount || ENGINE_CONFIG.prefetchForwardCount;
    this.onProgress = options.onProgress || (() => {});
    this.onError = options.onError || ((e) => console.error(e));

    this.canvas = null;
    this.ctx = null;

    this.demuxer = null;
    this.cache = new FrameCache(this.maxCacheSize);
    this.decoder = null;
    this.decoderConfig = null;

    this.totalFrames = 0;
    this.currentTargetFrame = 0;
    this.renderedFrame = -1;
    this.lastFedSampleIndex = -1;
    this.scrollDirection = 1;

    this.isProcessingQueue = false;
    this.pendingTargetFrame = null;

    this.timestampToSampleMap = new Map();
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  }

  async init() {
    if (typeof window.VideoDecoder === 'undefined') {
      this.onError(new Error('WebCodecs not supported. Use Chrome/Edge v94+.'));
      return false;
    }
    try {
      this.demuxer = new MP4Demuxer(this.videoUrl, (pct) => {
        this.onProgress({ stage: 'demuxing', progress: pct });
      });

      const { track, description, totalFrames } = await this.demuxer.load();
      this.totalFrames = totalFrames;

      for (let i = 0; i < this.demuxer.samples.length; i++) {
        const s = this.demuxer.samples[i];
        this.timestampToSampleMap.set(
          Math.round(s.cts * (1_000_000 / s.timescale)),
          i
        );
      }

      this.decoderConfig = {
        codec: track.codec,
        codedWidth: track.width,
        codedHeight: track.height,
        description
      };

      const support = await VideoDecoder.isConfigSupported(this.decoderConfig);
      if (!support?.supported) throw new Error(`Codec not supported: ${track.codec}`);

      this.setupDecoder();

      // Decode frame 0, then pre-warm the cache
      await this.decodeRange(0, Math.min(this.prefetchCount * 2, totalFrames - 1));

      this.onProgress({ stage: 'ready', progress: 1.0 });
      return true;
    } catch (err) {
      console.error('[Engine] Init failed:', err);
      this.onError(err);
      return false;
    }
  }

  setupDecoder() {
    if (this.decoder && this.decoder.state !== 'closed') {
      try { this.decoder.close(); } catch { /* ignore */ }
    }
    this.decoder = new VideoDecoder({
      output: (vf) => this.onVideoFrame(vf),
      error: (err) => {
        console.warn('[Engine] Decoder error:', err.message);
        this.lastFedSampleIndex = -1;
      }
    });
    this.decoder.configure(this.decoderConfig);
    this.lastFedSampleIndex = -1;
  }

  // ─── CORE: draw VideoFrame synchronously (zero async latency) ───────────────
  drawToCanvas(source) {
    const { canvas, ctx } = this;
    if (!canvas || !ctx || !source) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = source.displayWidth ?? source.width ?? source.naturalWidth ?? cw;
    const ih = source.displayHeight ?? source.height ?? source.naturalHeight ?? ch;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.drawImage(source, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  onVideoFrame(videoFrame) {
    const timestamp = videoFrame.timestamp;
    const idx = this.timestampToSampleMap.get(timestamp) ?? this.findNearest(timestamp);

    // ── DRAW IMMEDIATELY (synchronous — no async gap) ──────────────────────────
    // Only draw if this frame is closer to the current target than what's shown,
    // AND it's actually in the forward decode path (not a stale prefetch).
    const distToTarget = Math.abs(idx - this.currentTargetFrame);
    const distRendered = Math.abs(this.renderedFrame - this.currentTargetFrame);
    const isForwardDecode = idx <= this.currentTargetFrame || this.renderedFrame === -1;
    const isUseful = isForwardDecode && (this.renderedFrame === -1 || distToTarget < distRendered);

    if (isUseful) {
      this.renderedFrame = idx;
      this.drawToCanvas(videoFrame); // synchronous VideoFrame draw
    }

    // ── CACHE as ImageBitmap asynchronously (for future instant draws) ─────────
    createImageBitmap(videoFrame)
      .then((bitmap) => {
        videoFrame.close();
        this.cache.put(idx, bitmap, this.currentTargetFrame);
      })
      .catch(() => {
        try { videoFrame.close(); } catch { /* ignore */ }
      });
  }

  findNearest(timestamp) {
    let best = 0, minDiff = Infinity;
    for (const [ts, i] of this.timestampToSampleMap.entries()) {
      const d = Math.abs(ts - timestamp);
      if (d < minDiff) { minDiff = d; best = i; }
    }
    return best;
  }

  // Returns the nearest cached frame index to target, or -1 if cache is empty
  nearestCached(target) {
    let best = -1, minDist = Infinity;
    for (const key of this.cache.keys()) {
      const d = Math.abs(key - target);
      if (d < minDist) { minDist = d; best = key; }
    }
    return best;
  }

  requestFrame(targetFrameIndex) {
    if (!this.demuxer?.isReady) return;
    targetFrameIndex = Math.max(0, Math.min(targetFrameIndex, this.totalFrames - 1));

    const prev = this.currentTargetFrame;
    this.currentTargetFrame = targetFrameIndex;
    this.scrollDirection = targetFrameIndex >= prev ? 1 : -1;

    // ── INSTANT DRAW: cache hit ─────────────────────────────────────────────────
    if (this.cache.has(targetFrameIndex)) {
      this.renderedFrame = targetFrameIndex;
      this.drawToCanvas(this.cache.get(targetFrameIndex));
    } else {
      // ── INSTANT DRAW: nearest cached frame — but only if close enough ──────────
      // Drawing a frame 200 frames away would look like a jump/flash (jitter).
      const nearest = this.nearestCached(targetFrameIndex);
      if (nearest !== -1 && Math.abs(nearest - targetFrameIndex) <= 30) {
        this.drawToCanvas(this.cache.get(nearest));
      }
    }

    this.pendingTargetFrame = targetFrameIndex;
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;
    try {
      while (this.pendingTargetFrame !== null) {
        const target = this.pendingTargetFrame;
        this.pendingTargetFrame = null;

        if (!this.cache.has(target)) {
          await this.decodeToTarget(target);
        }

        // After reaching target, prefetch ahead
        if (this.pendingTargetFrame === null) {
          const end = Math.min(this.totalFrames - 1, target + this.prefetchCount);
          await this.decodeRange(this.lastFedSampleIndex + 1, end);
        }
      }
    } catch (err) {
      console.error('[Engine] Queue error:', err);
    } finally {
      this.isProcessingQueue = false;
      if (this.pendingTargetFrame !== null) this.processQueue();
    }
  }

  async decodeToTarget(targetIndex) {
    if (!this.decoder || this.decoder.state === 'closed') this.setupDecoder();

    const kf = this.demuxer.getPrecedingKeyframe(targetIndex);
    const canContinue =
      this.decoder.state === 'configured' &&
      this.lastFedSampleIndex >= kf &&
      this.lastFedSampleIndex < targetIndex;

    if (!canContinue) {
      this.setupDecoder();
    }

    const start = canContinue ? this.lastFedSampleIndex + 1 : kf;
    await this.feedSamples(start, targetIndex);
  }

  async decodeRange(start, end) {
    if (!this.decoder || this.decoder.state === 'closed') return;
    if (start > end) return;
    await this.feedSamples(start, end);
  }

  async feedSamples(start, end) {
    for (let i = start; i <= end; i++) {
      // Abort if a newer scroll request came in
      if (this.pendingTargetFrame !== null && i > this.currentTargetFrame) break;

      if (this.decoder.decodeQueueSize > 15) {
        await new Promise((r) => setTimeout(r, 0)); // yield to event loop
      }

      const sample = this.demuxer.samples[i];
      if (!sample) continue;

      try {
        this.decoder.decode(new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: Math.round(sample.cts * (1_000_000 / sample.timescale)),
          duration: Math.round(sample.duration * (1_000_000 / sample.timescale)),
          data: sample.data
        }));
        this.lastFedSampleIndex = i;
      } catch (err) {
        console.warn('[Engine] Chunk error at sample', i, err.message);
        this.setupDecoder();
        break;
      }
    }
  }

  destroy() {
    if (this.decoder && this.decoder.state !== 'closed') {
      try { this.decoder.close(); } catch { /* ignore */ }
    }
    this.cache.clear();
  }
}
