import React, { useState, useCallback, useRef } from 'react';
import TransitionOverlay from './components/TransitionOverlay.jsx';
import FrontviewEmbed from './components/FrontviewEmbed.jsx';
import HomepageEmbed from './components/HomepageEmbed.jsx';
import SectionFrame from './components/SectionFrame.jsx';

/**
 * ACM Root App — Navigation State Machine
 *
 * Views:
 *   'frontview'  — Globe/Earth spinning + hyperspace warp intro
 *   'homepage'   — ACM CITY 2 cinematic city scroll
 *   'section'    — Individual section pages (events, editorial, research, headquarters, connect)
 *
 * Transitions always fade through black (TransitionOverlay) for a seamless feel.
 */

const TRANSITION_DURATION = 700; // ms — black fade duration

export default function App() {
  const [view, setView] = useState('frontview');
  const [section, setSection] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [homepageShouldReset, setHomepageShouldReset] = useState(false);

  // Generic transition helper: fade to black → swap view → fade back in
  const transitionTo = useCallback((newView, newSection = null) => {
    if (transitioning) return;
    setTransitioning(true);

    // Phase 1: fade to black
    setTimeout(() => {
      setView(newView);
      setSection(newSection);

      // Phase 2: fade back in after a brief hold (lets iframe settle)
      setTimeout(() => {
        setTransitioning(false);
      }, TRANSITION_DURATION + 150);
    }, TRANSITION_DURATION);
  }, [transitioning]);

  // Frontview signals it's done (user scrolled through globe + warp)
  const handleFrontviewComplete = useCallback(() => {
    transitionTo('homepage');
  }, [transitionTo]);

  // Homepage signals a building was entered
  const handleNavigate = useCallback((sectionId) => {
    transitionTo('section', sectionId);
  }, [transitionTo]);

  // User clicks "Return to City" from a section page
  const handleBack = useCallback(() => {
    setHomepageShouldReset(false); // reset pulse before triggering
    transitionTo('homepage');
    // After transition completes, signal homepage to return to city view
    setTimeout(() => {
      setHomepageShouldReset(true);
      // Clear the flag after a moment so it can be re-triggered next time
      setTimeout(() => setHomepageShouldReset(false), 500);
    }, TRANSITION_DURATION * 2 + 200);
  }, [transitionTo]);

  return (
    <>
      {/* Frontview — always mounted so it's ready, shown/hidden via visibility */}
      <FrontviewEmbed
        visible={view === 'frontview'}
        onComplete={handleFrontviewComplete}
      />

      {/* Homepage — always mounted so frames stay in memory, shown/hidden via visibility */}
      <HomepageEmbed
        visible={view === 'homepage'}
        onNavigate={handleNavigate}
        shouldReset={homepageShouldReset}
      />

      {/* Section pages — only renders when a section is active */}
      <SectionFrame
        section={section}
        visible={view === 'section'}
        onBack={handleBack}
      />

      {/* Black fade overlay — always on top during transitions */}
      <TransitionOverlay
        visible={transitioning}
        duration={TRANSITION_DURATION}
      />
    </>
  );
}
