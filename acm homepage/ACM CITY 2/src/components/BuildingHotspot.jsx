import React from 'react';
import { CITY_STOPS } from '../config/cityTimeline.js';

/**
 * Interactive building HUD and hotspot overlay layered above cinematic canvas.
 * Renders contextual sector cards and navigation bookmarks.
 */
export const BuildingHotspot = ({
  progress = 0,
  onNavigateToStop
}) => {
  // Find current active stop
  const stopsList = Object.values(CITY_STOPS);
  const activeStop = stopsList.find((stop) => {
    return progress >= stop.range[0] && progress <= stop.range[1];
  }) || stopsList[0];

  return (
    <div className="hud-overlay-container">
      {/* Top Navigation HUD */}
      <header className="hud-header">
        <div className="acm-brand">
          <div className="acm-logo-glow"></div>
          <span className="brand-title">ACM CITY</span>
          <span className="brand-tagline">CINEMATIC FRAME ENGINE</span>
        </div>

        <nav className="hud-nav-bookmarks">
          {stopsList.map((stop) => {
            const isActive = progress >= stop.range[0] && progress <= stop.range[1];
            return (
              <button
                key={stop.id}
                className={`hud-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigateToStop && onNavigateToStop(stop.progress)}
              >
                <span className="nav-dot"></span>
                <span className="nav-label">{stop.badge}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Dynamic Sector Card */}
      <div className="sector-card-container">
        {activeStop && (
          <div className="sector-card" key={activeStop.id}>
            <div className="sector-header">
              <span className="sector-badge">{activeStop.badge}</span>
              <span className="sector-progress">{Math.round(progress * 100)}% JOURNEY</span>
            </div>
            <h2 className="sector-title">{activeStop.title}</h2>
            <p className="sector-subtitle">{activeStop.subtitle}</p>
            <p className="sector-desc">{activeStop.description}</p>

            {activeStop.actions && (
              <div className="sector-actions">
                {activeStop.actions.map((act, idx) => (
                  <a
                    key={idx}
                    href={act.link}
                    className="action-btn"
                    onClick={(e) => e.preventDefault()}
                  >
                    {act.label}
                    <span className="btn-arrow">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll Indicator at bottom */}
      <div className="hud-scroll-hint">
        <div className="mouse-icon">
          <div className="wheel"></div>
        </div>
        <span>SCROLL TO EXPLORE CITY</span>
      </div>
    </div>
  );
};
