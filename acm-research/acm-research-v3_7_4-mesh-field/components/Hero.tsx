'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, prefersReducedMotion, scrollToHash, ScrollTrigger } from './motion';
import ScrambleHeading from './ScrambleHeading';

const STATS = [
  { value: '05', label: 'Specialized Labs', sub: 'Active Working Groups' },
  { value: '18+', label: 'Publications', sub: 'Conferences & Preprints' },
  { value: '30+', label: 'Student Fellows', sub: 'Undergrad & Masters' },
  { value: '100%', label: 'Open Access', sub: 'Public Code & Benchmarks' },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const navigateTo = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToHash(hash);
  };

  // Scroll once from hero fully brings to #areas
  useEffect(() => {
    let isTransitioning = false;
    let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if near the top (in the hero section)
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      if (isTransitioning) {
        return;
      }

      // Scrolling down from Hero -> snap completely to #areas
      if (scrollY < vh * 0.4 && e.deltaY > 15) {
        isTransitioning = true;
        scrollToHash('#areas');
        transitionTimeout = setTimeout(() => {
          isTransitioning = false;
        }, 1100);
      }
      // Scrolling up while just entered #areas -> snap back to top
      else if (scrollY > 50 && scrollY < vh * 0.95 && e.deltaY < -15) {
        isTransitioning = true;
        scrollToHash('#top');
        transitionTimeout = setTimeout(() => {
          isTransitioning = false;
        }, 1100);
      }
    };

    // Touch swipe gesture support for mobile / trackpads
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;
      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Swiping up (scrolling down)
      if (scrollY < vh * 0.35 && diff > 40) {
        isTransitioning = true;
        scrollToHash('#areas');
        transitionTimeout = setTimeout(() => {
          isTransitioning = false;
        }, 1100);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (transitionTimeout) clearTimeout(transitionTimeout);
    };
  }, []);

  // Entrance & Scroll Animation Timeline
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // 1. Entrance animation (GSAP power4.out stagger)
    const entranceTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    entranceTl
      .fromTo(
        badgeRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.15
      )
      .fromTo(
        titleRef.current?.children || [],
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.15 },
        0.25
      )
      .fromTo(
        paraRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85 },
        0.55
      )
      .fromTo(
        ctaRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
        0.75
      )
      .fromTo(
        statsRef.current?.children || [],
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
        0.9
      );

    // 2. Cinematic Parallax Scroll Sequence & Snap
    let scrollTriggerInstance: { kill: () => void } | null = null;

    if (heroRef.current) {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          snap: {
            snapTo: [0, 1],
            duration: { min: 0.5, max: 0.85 },
            ease: 'power2.inOut',
            delay: 0.04,
          },
          onUpdate: (self) => {
            // Dismiss scroll hint immediately on first scroll
            if (scrollHintRef.current) {
              const hintOpacity = Math.max(0, 1 - self.progress * 6);
              scrollHintRef.current.style.opacity = `${hintOpacity}`;
              scrollHintRef.current.style.transform = `translateX(-50%) translateY(${self.progress * 35}px)`;
            }
          },
        },
      });

      // Hero Content Parallax: Centered content scales down, lifts up, and fades out cleanly
      if (heroContentRef.current) {
        scrollTl.to(
          heroContentRef.current,
          {
            yPercent: -35,
            scale: 0.92,
            opacity: 0,
            ease: 'none',
          },
          0
        );
      }

      scrollTriggerInstance = scrollTl.scrollTrigger as unknown as { kill: () => void };
    }

    return () => {
      entranceTl.kill();
      scrollTriggerInstance?.kill();
    };
  }, []);

  return (
    <section className="hero hero-centered" ref={heroRef} id="top">
      {/* Centered Hero Main Content */}
      <div className="hero-inner hero-inner-centered">
        <div className="hero-copy hero-copy-centered" ref={heroContentRef}>
          {/* Status Badge */}
          <div className="hero-status-pill" ref={badgeRef}>
            <span className="beacon-indicator">
              <span className="beacon-dot" />
              <span className="beacon-ping" />
            </span>
            <span className="status-label">ACM STUDENT CHAPTER</span>
            <span className="status-sep">/</span>
            <span className="status-sub">DJSCE MUMBAI</span>
            <span className="status-badge-chip">LABS ACTIVE</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title hero-title-centered" ref={titleRef}>
            <span className="hero-title-row">
              <ScrambleHeading
                as="span"
                text="DJSCE ACM"
                className="hero-line hero-line-main"
                minSwaps={2}
                maxSwaps={3}
                stepDelay={75}
              />
            </span>
            <span className="hero-title-row">
              <ScrambleHeading
                as="span"
                text="RESEARCH"
                className="hero-line hero-line-gradient"
                minSwaps={2}
                maxSwaps={3}
                stepDelay={75}
              />
            </span>
          </h1>

          {/* Mission Paragraph */}
          <p className="hero-para hero-para-centered" ref={paraRef}>
            Pioneering student-led breakthroughs in computer science at DJSCE.
            We couple rigorous theoretical foundations with deployable systems
            across <strong className="text-highlight">Machine Learning</strong>,{' '}
            <strong className="text-highlight">Cybersecurity</strong>,{' '}
            <strong className="text-highlight">Distributed Systems</strong>,{' '}
            <strong className="text-highlight">HCI</strong> and{' '}
            <strong className="text-highlight">Software Architecture</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta hero-cta-centered" ref={ctaRef}>
            <a
              href="#areas"
              className="btn btn-primary hero-btn-main"
              onClick={navigateTo('#areas')}
            >
              <span>Explore Research Areas</span>
              <svg
                className="btn-arrow-icon"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4.167 10h11.666M10.833 5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#publications"
              className="btn btn-ghost hero-btn-sub"
              onClick={navigateTo('#publications')}
            >
              <span>Read Publications</span>
              <span className="btn-tag">10+ Papers</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-stats hero-stats-centered" ref={statsRef}>
            {STATS.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-val">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sub">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Indicator */}
      <div
        className="hero-scrollhint"
        ref={scrollHintRef}
        aria-hidden="true"
        onClick={navigateTo('#areas')}
        style={{ cursor: 'pointer' }}
      >
        <span />
        SCROLL TO EXPLORE
      </div>
    </section>
  );
}
