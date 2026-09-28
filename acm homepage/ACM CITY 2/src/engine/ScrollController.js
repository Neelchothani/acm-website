/**
 * ScrollController — reads window.scrollY every RAF tick, maps directly
 * to frame index, and magnetically auto-scrolls to departmental milestone
 * frames when the user is within the threshold distance (e.g. 20 frames).
 */
export class ScrollController {
  constructor(options = {}) {
    this.totalFrames = options.totalFrames || 840;
    this.snapTargets = options.snapTargets || [300, 570, 839];
    this.snapThreshold = options.snapThreshold || 100; // 100 frames distance
    this.onFrameChange = options.onFrameChange || (() => {});

    this.currentFrame = -1;
    this.rafId = null;
    this.snapAnimRaf = null;
    this.isDestroyed = false;
    this.isSnapping = false;
    this.snapDebounceTimer = null;

    this.tick = this.tick.bind(this);
    this.onUserScrollIntent = this.onUserScrollIntent.bind(this);
    this.checkMagneticSnap = this.checkMagneticSnap.bind(this);
  }

  getMaxScroll() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  getScrollYForFrame(frame) {
    const clampedFrame = Math.max(0, Math.min(frame, this.totalFrames - 1));
    return (clampedFrame / (this.totalFrames - 1)) * this.getMaxScroll();
  }

  init() {
    this.isDestroyed = false;
    this.rafId = requestAnimationFrame(this.tick);

    // Listen for scroll and user input to manage snapping
    window.addEventListener('scroll', this.onUserScrollIntent, { passive: true });
    window.addEventListener('wheel', this.cancelSnapAnimation, { passive: true });
    window.addEventListener('touchstart', this.cancelSnapAnimation, { passive: true });
    window.addEventListener('keydown', this.cancelSnapAnimation, { passive: true });
  }

  cancelSnapAnimation = () => {
    if (this.snapAnimRaf) {
      cancelAnimationFrame(this.snapAnimRaf);
      this.snapAnimRaf = null;
    }
    this.isSnapping = false;
  };

  onUserScrollIntent() {
    if (this.isDestroyed) return;

    // Reset debounce timer on every scroll event
    clearTimeout(this.snapDebounceTimer);

    // If auto-snap is not running, check if we should trigger one when scrolling pauses
    if (!this.isSnapping) {
      this.snapDebounceTimer = setTimeout(this.checkMagneticSnap, 120);
    }
  }

  checkMagneticSnap() {
    if (this.isDestroyed || this.isSnapping) return;

    const maxScroll = this.getMaxScroll();
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    const currentFrame = Math.round(progress * (this.totalFrames - 1));

    // Check if within 20 frames of any departmental target frame
    for (const targetFrame of this.snapTargets) {
      const distance = Math.abs(currentFrame - targetFrame);
      if (distance > 0 && distance <= this.snapThreshold) {
        const targetScrollY = this.getScrollYForFrame(targetFrame);
        this.smoothScrollTo(targetScrollY);
        break;
      }
    }
  }

  smoothScrollTo(targetY, duration = 450) {
    this.cancelSnapAnimation();
    this.isSnapping = true;

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) {
      this.isSnapping = false;
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      if (this.isDestroyed || !this.isSnapping) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const newY = startY + distance * ease;

      window.scrollTo(0, newY);

      if (progress < 1) {
        this.snapAnimRaf = requestAnimationFrame(animate);
      } else {
        window.scrollTo(0, targetY);
        this.isSnapping = false;
        this.snapAnimRaf = null;
      }
    };

    this.snapAnimRaf = requestAnimationFrame(animate);
  }

  tick() {
    if (this.isDestroyed) return;

    const progress = Math.max(0, Math.min(1, window.scrollY / this.getMaxScroll()));
    const frame = Math.round(progress * (this.totalFrames - 1));

    if (frame !== this.currentFrame) {
      this.currentFrame = frame;
      this.onFrameChange(frame);
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  destroy() {
    this.isDestroyed = true;
    this.cancelSnapAnimation();
    clearTimeout(this.snapDebounceTimer);

    if (this.rafId) cancelAnimationFrame(this.rafId);

    window.removeEventListener('scroll', this.onUserScrollIntent);
    window.removeEventListener('wheel', this.cancelSnapAnimation);
    window.removeEventListener('touchstart', this.cancelSnapAnimation);
    window.removeEventListener('keydown', this.cancelSnapAnimation);
  }
}
