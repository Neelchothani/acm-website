import React from 'react';

/**
 * Debug overlay displaying real-time engine telemetry:
 * Frame index, progress, cache utilization, decoder state, and rendering FPS.
 */
export const DebugPanel = ({ stats, isVisible, onToggle }) => {
  if (!isVisible) {
    return (
      <button
        className="debug-toggle-btn"
        onClick={onToggle}
        title="Toggle WebCodecs Debug Telemetry (Key: D)"
      >
        <span className="debug-dot"></span>
        ENGINE STATS
      </button>
    );
  }

  const {
    currentFrame = 0,
    renderedFrame = 0,
    totalFrames = 840,
    progress = 0,
    cachedCount = 0,
    maxCache = 45,
    decoderState = 'ready',
    queueSize = 0,
    fps = 60,
    keyframe = 0
  } = stats || {};

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <div className="debug-title">
          <span className="debug-indicator live"></span>
          WEBCODECS FRAME ENGINE
        </div>
        <button className="debug-close-btn" onClick={onToggle}>✕</button>
      </div>

      <div className="debug-grid">
        <div className="debug-item">
          <span className="debug-label">Target Frame</span>
          <span className="debug-value">{currentFrame} / {totalFrames}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Rendered Frame</span>
          <span className="debug-value highlight">{renderedFrame}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Scroll Progress</span>
          <span className="debug-value">{(progress * 100).toFixed(1)}%</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Frame Cache</span>
          <span className="debug-value">{cachedCount} / {maxCache}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Decoder State</span>
          <span className={`debug-badge ${decoderState}`}>{decoderState}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Queue Size</span>
          <span className="debug-value">{queueSize}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Render Rate</span>
          <span className={`debug-value ${fps >= 50 ? 'good' : 'warning'}`}>{fps} FPS</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Active Keyframe</span>
          <span className="debug-value">KF #{keyframe}</span>
        </div>
      </div>

      <div className="debug-timeline-bar">
        <div
          className="debug-timeline-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  );
};
