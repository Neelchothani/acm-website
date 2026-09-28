import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function CheckInForm({ isVisible, onBackToLobby }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    msgtype: 'Enquiry',
    events: [],
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [ticketId, setTicketId] = useState('');

  const eventOptions = [
    { id: 'rooftop-lounge', label: 'Rooftop Lounge Night' },
    { id: 'tech-summit', label: 'Tech Summit' },
    { id: 'live-dj', label: 'Live DJ Set' },
    { id: 'art-installation', label: 'Neon Art Installation' },
    { id: 'wine-tasting', label: 'Wine Tasting' },
    { id: 'business-mixer', label: 'Business Mixer' }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleEventToggle = (eventId) => {
    setFormData((prev) => {
      const exists = prev.events.includes(eventId);
      return {
        ...prev,
        events: exists
          ? prev.events.filter((id) => id !== eventId)
          : [...prev.events, eventId]
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us what you need';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate concierge transmission delay
    setTimeout(() => {
      const generatedId = Math.floor(100000 + Math.random() * 900000).toString();
      setTicketId(generatedId);
      setConfirmationData(formData);
      setIsSubmitting(false);
    }, 800);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      msgtype: 'Enquiry',
      events: [],
      subject: '',
      message: ''
    });
    setConfirmationData(null);
    setErrors({});
  };

  return (
    <>
      <div className={`content ${isVisible ? 'show' : ''}`} id="formContent">
        <div className="wrap">
          {/* Header Brand and Navigation */}
          <div className="brand-nav">
            <div className="brand">
              <div className="brand-mark">
                <span>D</span>
              </div>
              <div className="brand-text">
                <div className="brand-name">
                  Digital City <span>— Reception</span>
                </div>
                <div className="brand-sub">ACM Connect • Concierge Desk</div>
              </div>
            </div>

            <button
              className="back-desk-btn"
              onClick={onBackToLobby}
              title="Return to the Reception Scene"
            >
              <ArrowLeft size={16} />
              <span>Lobby View</span>
            </button>
          </div>

          {/* Form Glass Panel */}
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <div className="panel-head">
              <h1>Welcome to the desk</h1>
              <p>
                Tell us who you are and how we can help — our concierge team replies within the hour.
              </p>
            </div>

            {/* Name Field */}
            <div className="field">
              <label htmlFor="name">
                <span className="label-title">
                  Name <span className="req">*</span>
                </span>
                {errors.name && <span className="field-error-hint">{errors.name}</span>}
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Phone & Email side-by-side on larger screens */}
            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98XXX XXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="email">
                  <span>Email</span>
                  {errors.email && <span className="field-error-hint">{errors.email}</span>}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Message Type */}
            <div className="field">
              <label htmlFor="msgtype">Message Type</label>
              <div className="select-wrap">
                <select
                  id="msgtype"
                  value={formData.msgtype}
                  onChange={handleInputChange}
                >
                  <option value="Enquiry">Enquiry</option>
                  <option value="Booking">Booking</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Support">Support</option>
                </select>
                <ChevronDown size={18} className="select-arrow" />
              </div>
            </div>

            {/* Events multi-select chips */}
            <div className="field">
              <label>
                <span>Events</span>
                {formData.events.length > 0 && (
                  <span className="chip-counter">
                    {formData.events.length} selected
                  </span>
                )}
              </label>
              <div className="chip-grid">
                {eventOptions.map((ev) => (
                  <label key={ev.id} className="chip">
                    <input
                      name="events"
                      type="checkbox"
                      value={ev.id}
                      checked={formData.events.includes(ev.id)}
                      onChange={() => handleEventToggle(ev.id)}
                    />
                    <span>{ev.label}</span>
                  </label>
                ))}
              </div>
              <div className="field-hint">
                <Sparkles size={14} color="var(--neon-cyan)" />
                <span>Select any that interest you — multiple choices welcome.</span>
              </div>
            </div>

            {/* Subject */}
            <div className="field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>

            {/* Message */}
            <div className="field">
              <label htmlFor="message">
                <span>Message <span className="req">*</span></span>
                {errors.message && <span className="field-error-hint">{errors.message}</span>}
              </label>
              <textarea
                id="message"
                placeholder="Tell us what you need..."
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              className="submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Connecting to Concierge...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationData && (
        <ConfirmationModal
          data={confirmationData}
          ticketId={ticketId}
          onClose={handleResetForm}
          onReturnToLobby={() => {
            handleResetForm();
            onBackToLobby();
          }}
        />
      )}
    </>
  );
}
