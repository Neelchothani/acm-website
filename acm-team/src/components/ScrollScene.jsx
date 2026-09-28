import React, { useEffect, useRef, useState, useCallback } from 'react';
import HeroDotField from './HeroDotField.jsx';
import HeroHeading from './HeroHeading.jsx';
import TeamPhoto from './TeamPhoto.jsx';
import { TEAM } from '../data/teamData.js';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t) => 1 - Math.pow(1 - t, 3);
const seg = (p, a, b) => clamp01((p - a) / (b - a));

function overlaps(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

export default function ScrollScene() {
  const sceneRef = useRef(null);
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const revealRef = useRef(null);
  const cueRef = useRef(null);
  const photoRef = useRef(null);
  const frameRef = useRef(null);
  const cardRef = useRef(null);
  const hitsRef = useRef([]);
  const fieldInteractRef = useRef(null);

  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(-1);
  const [displayedMember, setDisplayedMember] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const liveRef = useRef(false);
  const activeRef = useRef(-1);
  const pinnedRef = useRef(-1);
  const hideTimerRef = useRef(null);

  activeRef.current = active;
  pinnedRef.current = pinned;
  liveRef.current = isLive;

  const cancelClose = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    setActive(-1);
    setPinned(-1);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (pinnedRef.current < 0) {
        close();
      }
    }, 170);
  }, [close]);

  const layout = useCallback((i) => {
    const card = cardRef.current;
    if (!card) return;

    if (typeof window === 'undefined' || window.innerWidth <= 760) {
      card.style.left = '';
      card.style.top = '';
      return;
    }
    const photo = photoRef.current;
    if (!photo || i < 0 || i >= TEAM.length) return;

    const p = TEAM[i];
    const W = photo.clientWidth;
    const H = photo.clientHeight;
    const S = { x: (p.spot.l / 100) * W, y: (p.spot.t / 100) * H, w: (p.spot.w / 100) * W, h: (p.spot.h / 100) * H };
    const pad = 14;
    const F = {
      x: (p.face.l / 100) * W - pad,
      y: (p.face.t / 100) * H - pad,
      w: (p.face.w / 100) * W + pad * 2,
      h: (p.face.h / 100) * H + pad * 2
    };
    const cw = card.offsetWidth, ch = card.offsetHeight, gap = 20, edge = 6;

    let cx, cy;
    if (W - (S.x + S.w) >= cw + gap + edge) cx = S.x + S.w + gap;
    else if (S.x >= cw + gap + edge) cx = S.x - gap - cw;
    else cx = Math.min(Math.max(edge, S.x + S.w / 2 - cw / 2), W - cw - edge);

    cy = F.y + F.h / 2 - ch * 0.3;
    cy = Math.min(Math.max(edge, cy), Math.max(edge, H - ch - edge));

    if (overlaps({ x: cx, y: cy, w: cw, h: ch }, F)) {
      if (F.y + F.h + 8 + ch <= H - edge) cy = F.y + F.h + 8;
      else if (F.y - 8 - ch >= edge) cy = F.y - 8 - ch;
      else cx = F.x + F.w + gap <= W - cw - edge ? F.x + F.w + gap : Math.max(edge, F.x - gap - cw);
    }
    card.style.left = cx.toFixed(1) + 'px';
    card.style.top = cy.toFixed(1) + 'px';
  }, []);

  const open = useCallback((i) => {
    setActive(i);
    setDisplayedMember(TEAM[i]);
    requestAnimationFrame(() => {
      layout(i);
    });
  }, [layout]);

  const pick = useCallback((i) => {
    if (pinnedRef.current === i) {
      close();
    } else {
      setPinned(i);
      open(i);
    }
  }, [close, open]);

  const personAt = useCallback((e) => {
    const photo = photoRef.current;
    if (!photo) return -1;
    const r = photo.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    let best = -1, bestD = Infinity;

    TEAM.forEach((p, i) => {
      const h = p.hit;
      if (x < h.l || x > h.l + h.w || y < h.t || y > h.t + h.h) return;
      const dx = (x - (p.face.l + p.face.w / 2)) / p.face.w;
      const dy = (y - (p.face.t + p.face.h / 2)) / p.face.h;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, []);

  // Event handlers for photo
  const onPhotoMouseMove = useCallback((e) => {
    if (!liveRef.current || (cardRef.current && cardRef.current.contains(e.target))) return;
    const i = personAt(e);
    if (photoRef.current) {
      photoRef.current.style.cursor = i > -1 ? 'pointer' : '';
    }
    if (i > -1) {
      cancelClose();
      if (pinnedRef.current < 0) open(i);
    } else {
      scheduleClose();
    }
  }, [personAt, cancelClose, open, scheduleClose]);

  const onPhotoMouseLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const onPhotoClick = useCallback((e) => {
    if (!liveRef.current || (cardRef.current && cardRef.current.contains(e.target))) return;
    const i = personAt(e);
    if (i > -1) {
      e.stopPropagation();
      e.preventDefault();
      pick(i);
    }
  }, [personAt, pick]);

  // Hit focus/blur/key handlers
  const onHitFocus = useCallback((i) => {
    cancelClose();
    open(i);
  }, [cancelClose, open]);

  const onHitBlur = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const onHitKeyDown = useCallback((e, i) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(i);
    }
    if (e.key === 'ArrowRight' && hitsRef.current[i + 1]) {
      hitsRef.current[i + 1].focus();
    }
    if (e.key === 'ArrowLeft' && hitsRef.current[i - 1]) {
      hitsRef.current[i - 1].focus();
    }
  }, [pick]);

  // Global click & Escape listener
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target) && photoRef.current && !photoRef.current.contains(e.target)) {
        close();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    const handleResize = () => {
      if (activeRef.current > -1) layout(activeRef.current);
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [close, layout]);

  // Scroll choreography & reduced motion setup
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(reduced);

    if (reduced) {
      setIsLive(true);
      return;
    }

    const scene = sceneRef.current;
    const hero = heroRef.current;
    const stage = stageRef.current;
    const reveal = revealRef.current;
    const cue = cueRef.current;

    function render() {
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const track = scene.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / (track * 0.86)); // last 14% of track is rest

      const h = ease(seg(p, 0, 0.4));
      if (hero) {
        hero.style.transform = 'translate3d(0,' + (-h * 62) + 'vh,0) scale(' + (1 - h * 0.1) + ')';
        hero.style.opacity = 1 - seg(p, 0.05, 0.36);
      }
      if (cue) {
        cue.style.opacity = 1 - seg(p, 0, 0.12);
      }
      if (fieldInteractRef.current) {
        fieldInteractRef.current(1 - seg(p, 0.05, 0.4));
      }

      const g = ease(seg(p, 0.28, 0.9));
      if (stage) {
        stage.style.opacity = seg(p, 0.26, 0.44);
        stage.style.transform = 'translate3d(0,' + (6 * (1 - g)) + 'vh,0)';
      }
      if (reveal) {
        reveal.style.transform = g >= 1 ? '' : 'scale(' + (0.62 + 0.38 * g) + ')';
      }

      const liveNow = p >= 0.93;
      setIsLive(liveNow);
      if (!liveNow && activeRef.current > -1) {
        close();
      }
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          render();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [close]);

  return (
    <section
      className={`scene ${isReducedMotion ? 'is-static' : ''} ${isLive ? 'is-live' : ''}`}
      id="scene"
      ref={sceneRef}
    >
      <div
        className="sticky"
        style={
          isReducedMotion
            ? {
                backgroundImage: 'radial-gradient(rgba(234,246,248,.26) 1.25px,transparent 1.6px)',
                backgroundSize: '30px 30px'
              }
            : undefined
        }
      >
        <HeroDotField fieldInteractRef={fieldInteractRef} isReducedMotion={isReducedMotion} />

        <div
          className="hero"
          id="hero"
          ref={heroRef}
          style={isReducedMotion ? { transform: 'none' } : undefined}
        >
          <HeroHeading text="Our team" isReducedMotion={isReducedMotion} />
          <p className="tag">The people behind <b>ACM</b> &mdash; scroll to meet them</p>
          <p className="intro">We are a collective of developers, designers, and innovators at ACM. United by curiosity and code, we build transformative software, lead high-impact initiatives, and cultivate a community of problem-solvers turning bold ideas into reality.</p>
        </div>

        <div className="stage" id="stage" ref={stageRef}>
          <h2 className="lead" id="lead"><em>THE MINDS</em> SHAPING THE FUTURE OF COMPUTING</h2>
          <div className="reveal" id="reveal" ref={revealRef}>
            <TeamPhoto
              photoRef={photoRef}
              frameRef={frameRef}
              cardRef={cardRef}
              active={active}
              pinned={pinned}
              displayedMember={displayedMember}
              hitsRef={hitsRef}
              onPhotoMouseMove={onPhotoMouseMove}
              onPhotoMouseLeave={onPhotoMouseLeave}
              onPhotoClick={onPhotoClick}
              onHitFocus={onHitFocus}
              onHitBlur={onHitBlur}
              onHitKeyDown={onHitKeyDown}
              onCardMouseEnter={cancelClose}
              onCardMouseLeave={scheduleClose}
            />
          </div>
        </div>

        <div
          className="scroll-cue"
          id="cue"
          ref={cueRef}
          aria-hidden="true"
          style={isReducedMotion ? { display: 'none' } : undefined}
        >
          <span>SCROLL</span>
          <i></i>
        </div>
      </div>
    </section>
  );
}
