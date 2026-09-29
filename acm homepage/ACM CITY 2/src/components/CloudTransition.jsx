import React from 'react';
import './CloudTransition.css';

/**
 * CloudTransition
 * Cinematic transition where dense, billowy volumetric clouds surge in from both
 * the left and right edges, converging and enveloping the entire screen before redirection.
 * When returning, the clouds part outward to reveal the city.
 */
export const CloudTransition = ({ isCovering, isExiting, buildingTitle = '' }) => {
  if (!isCovering && !isExiting) return null;

  const modeClass = isExiting ? 'clouds-parting' : 'clouds-surging';

  return (
    <div className={`cloud-transition-overlay ${modeClass}`} aria-hidden="true">
      {/* SVG Turbulence Filter for authentic organic cloud billow distortion */}
      <svg className="cloud-svg-filter" width="0" height="0">
        <filter id="cloud-filter-organic">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="48"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Atmospheric Mist Wash / Ambient Fog Bed */}
      <div className="cloud-ambient-wash" />

      {/* LEFT CLOUD MASS (Surges from Left to Center) */}
      <div className="cloud-bank cloud-bank-left">
        <div className="cloud-mass-body">
          <div className="cloud-puff puff-l1" />
          <div className="cloud-puff puff-l2" />
          <div className="cloud-puff puff-l3" />
          <div className="cloud-puff puff-l4" />
          <div className="cloud-puff puff-l5" />
          <div className="cloud-puff puff-l6" />
          <div className="cloud-puff puff-l7" />
          <div className="cloud-puff puff-l8" />
        </div>
        {/* Leading wisps that race across first */}
        <div className="cloud-tendril tendril-l1" />
        <div className="cloud-tendril tendril-l2" />
        <div className="cloud-tendril tendril-l3" />
      </div>

      {/* RIGHT CLOUD MASS (Surges from Right to Center) */}
      <div className="cloud-bank cloud-bank-right">
        <div className="cloud-mass-body">
          <div className="cloud-puff puff-r1" />
          <div className="cloud-puff puff-r2" />
          <div className="cloud-puff puff-r3" />
          <div className="cloud-puff puff-r4" />
          <div className="cloud-puff puff-r5" />
          <div className="cloud-puff puff-r6" />
          <div className="cloud-puff puff-r7" />
          <div className="cloud-puff puff-r8" />
        </div>
        {/* Leading wisps that race across first */}
        <div className="cloud-tendril tendril-r1" />
        <div className="cloud-tendril tendril-r2" />
        <div className="cloud-tendril tendril-r3" />
      </div>

      {/* Center Merge Blanket (ensures 100% full opaque coverage at peak) */}
      <div className="cloud-center-merge" />

      {/* Atmospheric floating particles/mist dust */}
      <div className="cloud-mist-layer" />

      {/* Subtle modern HUD indicator */}
      {buildingTitle && !isExiting && (
        <div className="cloud-hud-label">
          <span className="cloud-hud-icon" />
          <span>ENTERING // {buildingTitle.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};
