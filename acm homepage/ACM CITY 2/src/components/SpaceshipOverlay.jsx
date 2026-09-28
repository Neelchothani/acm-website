import React from 'react';

/**
 * Independent Spaceship / Drone flight overlay.
 * Runs on its own continuous CSS/RAF animation loop completely independent of scroll state.
 * When scroll stops, city camera stops, but the spaceship continues patrolling.
 */
export const SpaceshipOverlay = () => {
  return (
    <div className="spaceship-layer" aria-hidden="true">
      <div className="drone-craft">
        <div className="craft-body">
          <div className="cockpit-glow"></div>
          <div className="wing-left"></div>
          <div className="wing-right"></div>
          <div className="thruster-flame"></div>
          <div className="scanner-beam"></div>
        </div>
        <div className="craft-hud-tag">
          <span className="craft-name">ACM SKY-PATROL 07</span>
          <span className="craft-status">AUTONOMOUS</span>
        </div>
      </div>
    </div>
  );
};
