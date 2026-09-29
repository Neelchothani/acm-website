import React from 'react';
import { COCOM_DEPARTMENTS } from '../data/cocomData.js';

export default function CocomSection() {
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <section className="cocom-section" id="cocom">
      <div className="cocom-container">
        {/* Minimal Header */}
        <div className="cocom-header">
          <span className="cocom-badge">2024–2025</span>
          <h2 className="cocom-title">
            CO-<em>COMMITTEE</em>
          </h2>
        </div>

        {/* Member Cards Grouped by Department */}
        <div className="cocom-grouped-container">
          {COCOM_DEPARTMENTS.map((dept) => (
            <div key={dept.id} className="cocom-dept-block">
              <div className="cocom-dept-header">
                <span
                  className="cocom-dept-indicator"
                  style={{ background: dept.color }}
                />
                <h3 className="cocom-dept-name">{dept.name}</h3>
              </div>

              <div className="cocom-grid">
                {dept.members.map((name, idx) => (
                  <div
                    key={`${dept.id}-${name}-${idx}`}
                    className="cocom-card"
                    style={{
                      '--card-accent': dept.color,
                      '--card-accent-rgb': dept.accentRgb
                    }}
                  >
                    <div className="cocom-avatar">
                      <span>{getInitials(name)}</span>
                    </div>
                    <div className="cocom-card-info">
                      <h4 className="cocom-member-name">{name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


