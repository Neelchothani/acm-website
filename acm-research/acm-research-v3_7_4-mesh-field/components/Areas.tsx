'use client';

import { useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';
import { gsap, prefersReducedMotion } from './motion';

const AREAS: { name: string; blurb: string; glyph: string }[] = [
  {
    name: 'Artificial Intelligence & Machine Learning',
    blurb:
      'Models, learning theory and intelligent systems, from perception to agents.',
    glyph: 'neural',
  },
  {
    name: 'Software Engineering & Development',
    blurb:
      'How good software gets built: design, tooling, media and maintainable systems.',
    glyph: 'brackets',
  },
  {
    name: 'Cybersecurity & Privacy',
    blurb:
      'Attacks, defenses and the engineering of systems that keep people safe.',
    glyph: 'shield',
  },
  {
    name: 'Human-Computer Interaction',
    blurb:
      'Interfaces, perception and the ways people and machines meet.',
    glyph: 'cursor',
  },
  {
    name: 'Distributed Systems & Cloud Computing',
    blurb:
      'Computation at scale: networks, clouds and systems that span machines.',
    glyph: 'cloud',
  },
];

function Glyph({ kind }: { kind: string }) {
  switch (kind) {
    case 'neural':
      return (
        <svg viewBox="0 0 64 64" className="glyph glyph-neural" aria-hidden="true">
          <circle cx="14" cy="32" r="4" />
          <circle cx="32" cy="14" r="4" />
          <circle cx="32" cy="50" r="4" />
          <circle cx="50" cy="32" r="4" />
          <path d="M14 32 L32 14 M14 32 L32 50 M32 14 L50 32 M32 50 L50 32" />
        </svg>
      );
    case 'brackets':
      return (
        <svg viewBox="0 0 64 64" className="glyph glyph-brackets" aria-hidden="true">
          <path d="M22 18 L10 32 L22 46" />
          <path d="M42 18 L54 32 L42 46" />
          <path d="M34 14 L30 50" className="glyph-caret" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 64 64" className="glyph glyph-shield" aria-hidden="true">
          <path d="M32 8 L52 16 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V16 Z" />
          <path d="M24 31 L30 38 L41 25" className="glyph-check" />
        </svg>
      );
    case 'cursor':
      return (
        <svg viewBox="0 0 64 64" className="glyph glyph-cursor" aria-hidden="true">
          <path d="M18 10 L46 32 L32 35 L26 48 Z" />
          <path d="M40 44 Q48 48 54 44" className="glyph-wave" />
          <path d="M38 50 Q48 56 56 50" className="glyph-wave glyph-wave-2" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 64 64" className="glyph glyph-cloud" aria-hidden="true">
          <circle cx="20" cy="20" r="5" />
          <circle cx="46" cy="16" r="5" />
          <circle cx="32" cy="40" r="6" />
          <circle cx="52" cy="44" r="4" />
          <path d="M20 20 L32 40 M46 16 L32 40 M52 44 L32 40 M20 20 L46 16" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Areas() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion() || window.innerWidth < 900) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.area-card'));
    if (!cards.length) return;
    const gr = grid.getBoundingClientRect();
    const gcx = gr.left + gr.width / 2;
    const gcy = gr.top + gr.height / 2;
    const tweens = cards.map((card, i) => {
      const cr = card.getBoundingClientRect();
      const dx = gcx - (cr.left + cr.width / 2);
      const dy = gcy - (cr.top + cr.height / 2);
      return gsap.fromTo(
        card,
        {
          x: dx * 0.82,
          y: dy * 0.82,
          rotation: (i - 2) * 2.4,
          scale: 0.86,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            end: 'top 32%',
            scrub: 0.6,
          },
        }
      );
    });
    return () => {
      tweens.forEach((tw) => {
        (tw.scrollTrigger as { kill?: () => void } | undefined)?.kill?.();
        tw.kill();
      });
    };
  }, []);

  return (
    <section className="areas" id="areas">
      <div className="container">
        <SectionHeader
          index="02"
          kicker="ACM RESEARCH"
          title="Research Areas"
          meta="05 ACTIVE SECTORS"
        />
        <p className="section-lede">
          Our research spans five domains, from intelligent systems to the
          cloud. Every publication below comes out of one of them.
        </p>
        <div className="areas-grid" ref={gridRef}>
          {AREAS.map((area, i) => (
            <article className="area-card" key={area.name}>
              <div className="area-sign">
                <Glyph kind={area.glyph} />
                <span className="area-index">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{area.name}</h3>
              <p>{area.blurb}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
