import React, { useEffect, useRef } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*?/';

function randGlyph(not) {
  let g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  while (g === not) g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  return g;
}

function scramble(el, ch, minSwaps, maxSwaps, step, reduced) {
  if (reduced) {
    el.textContent = ch;
    return;
  }
  if (el._cancel) el._cancel();
  const timers = [];
  let dead = false;
  el._cancel = function () {
    dead = true;
    timers.forEach(clearTimeout);
    el.textContent = ch;
    el.style.opacity = '1';
    el._cancel = null;
  };
  const swaps = Math.floor(Math.random() * (maxSwaps - minSwaps + 1)) + minSwaps;
  el.style.opacity = '0.85';
  el.textContent = randGlyph(ch);
  for (let n = 1; n < swaps; n++) {
    timers.push(setTimeout(function () {
      if (!dead) {
        el.style.opacity = '0.9';
        el.textContent = randGlyph(ch);
      }
    }, n * step));
  }
  timers.push(setTimeout(function () {
    if (!dead) {
      el.textContent = ch;
      el.style.opacity = '1';
      el._cancel = null;
    }
  }, swaps * step));
}

export default function HeroHeading({ text = "Our team", isReducedMotion }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const liveSpans = containerRef.current.querySelectorAll('.ch .live');
    liveSpans.forEach((liveEl, i) => {
      const ch = liveEl.getAttribute('data-ch');
      setTimeout(() => {
        scramble(liveEl, ch, 2, 3, 75, isReducedMotion);
      }, 350 + i * 40);
    });
  }, [isReducedMotion]);

  const words = text.split(' ');

  return (
    <h1 id="title" aria-label={text} ref={containerRef}>
      {words.map((word, wIdx) => (
        <React.Fragment key={wIdx}>
          <span className="word">
            {Array.from(word).map((ch, cIdx) => (
              <span
                key={cIdx}
                className="ch"
                onMouseEnter={(e) => {
                  const liveEl = e.currentTarget.querySelector('.live');
                  if (liveEl) scramble(liveEl, ch, 2, 3, 75, isReducedMotion);
                }}
              >
                <span className="ghost" aria-hidden="true">{ch}</span>
                <span className="live" aria-hidden="true" data-ch={ch}>{ch}</span>
              </span>
            ))}
          </span>
          {wIdx < words.length - 1 && <span className="sp"></span>}
        </React.Fragment>
      ))}
    </h1>
  );
}
