/**
 * Memory-bounded frame cache storing rendered ImageBitmaps.
 * Converts VideoFrames to ImageBitmaps to free native decoder hardware surfaces immediately,
 * and calls bitmap.close() on eviction to prevent GPU/RAM memory leaks.
 */
export class FrameCache {
  constructor(maxSize = 45) {
    this.maxSize = maxSize;
    this.cache = new Map(); // frameIndex -> { bitmap, lastAccessed }
    this.accessCounter = 0;
  }

  has(index) {
    return this.cache.has(index);
  }

  get(index) {
    const entry = this.cache.get(index);
    if (entry) {
      entry.lastAccessed = ++this.accessCounter;
      return entry.bitmap;
    }
    return null;
  }

  put(index, bitmap, activeIndex = index) {
    if (this.cache.has(index)) {
      // Overwrite existing entry
      const existing = this.cache.get(index);
      if (existing.bitmap !== bitmap) {
        try {
          existing.bitmap.close();
        } catch {
          // Bitmap already closed
        }
      }
      existing.bitmap = bitmap;
      existing.lastAccessed = ++this.accessCounter;
      return;
    }

    // If cache is at maximum capacity, evict the entry farthest from the active scroll index
    if (this.cache.size >= this.maxSize) {
      this.evictFarthest(activeIndex);
    }

    this.cache.set(index, {
      bitmap,
      lastAccessed: ++this.accessCounter
    });
  }

  /**
   * Evicts the entry that is farthest in distance from the current target frame index.
   */
  evictFarthest(targetIndex) {
    let farthestKey = null;
    let maxDistance = -1;

    for (const [key] of this.cache.entries()) {
      const distance = Math.abs(key - targetIndex);
      if (distance > maxDistance) {
        maxDistance = distance;
        farthestKey = key;
      }
    }

    if (farthestKey !== null) {
      const entry = this.cache.get(farthestKey);
      if (entry && entry.bitmap) {
        try {
          entry.bitmap.close();
        } catch {
          // Bitmap already closed
        }
      }
      this.cache.delete(farthestKey);
    }
  }

  clear() {
    for (const [, entry] of this.cache.entries()) {
      if (entry && entry.bitmap) {
        try {
          entry.bitmap.close();
        } catch {
          // Bitmap already closed
        }
      }
    }
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}
