import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, Home, Sparkles, Clock, Mail, Phone, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConfirmationModal({ data, ticketId, onClose, onReturnToLobby }) {
  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#33e7ff', '#b14bff', '#8a5cff', '#10b981']
      });
    } catch {
      // Graceful fallback if canvas-confetti is not loaded
    }
  }, []);

  const eventLabels = {
    'rooftop-lounge': 'Rooftop Lounge Night',
    'tech-summit': 'Tech Summit',
    'live-dj': 'Live DJ Set',
    'art-installation': 'Neon Art Installation',
    'wine-tasting': 'Wine Tasting',
    'business-mixer': 'Business Mixer'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-badge">
          <CheckCircle2 size={32} />
        </div>

        <div className="modal-head">
          <h2>Transmission Confirmed</h2>
          <p>
            Your inquiry has reached the Digital City concierge team. A confirmation has been logged into our queue.
          </p>
        </div>

        <div className="receipt-box">
          <div className="receipt-row">
            <span className="receipt-label">TICKET ID</span>
            <span className="receipt-val cyan">#{ticketId}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">NAME</span>
            <span className="receipt-val">{data.name}</span>
          </div>

          {data.email && (
            <div className="receipt-row">
              <span className="receipt-label">EMAIL</span>
              <span className="receipt-val">{data.email}</span>
            </div>
          )}

          {data.phone && (
            <div className="receipt-row">
              <span className="receipt-label">PHONE</span>
              <span className="receipt-val">{data.phone}</span>
            </div>
          )}

          <div className="receipt-row">
            <span className="receipt-label">CATEGORY</span>
            <span className="receipt-val">{data.msgtype}</span>
          </div>

          {data.events && data.events.length > 0 && (
            <div className="receipt-row">
              <span className="receipt-label">EVENTS</span>
              <span className="receipt-val">
                {data.events.map((ev) => eventLabels[ev] || ev).join(', ')}
              </span>
            </div>
          )}

          <div className="receipt-row">
            <span className="receipt-label">STATUS</span>
            <span className="receipt-val" style={{ color: '#10b981' }}>
              ● Concierge Dispatched (SLA: &lt; 1hr)
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onReturnToLobby}>
            <Home size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Return to Desk
          </button>
          <button className="modal-btn-primary" onClick={onClose}>
            New Inquiry
            <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
