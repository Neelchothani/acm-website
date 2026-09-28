'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from './motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export default function Reveal({ children, className, delay = 0, y = 36 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }
    const tween = gsap.fromTo(
      el,
      { y, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
    return () => {
      (tween as unknown as { scrollTrigger?: { kill: () => void } }).scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
