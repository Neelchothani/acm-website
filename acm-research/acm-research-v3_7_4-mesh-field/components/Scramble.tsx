'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './motion';

const GLYPHS = '!<>-_/[]{}=+*^?#01';

// Hover text-scramble (decrypt) effect, ReactBits DecryptedText style:
// on hover the text cycles through glyphs and resolves left to right.
export default function Scramble({
  text,
  className,
  trigger,
}: {
  text: string;
  className?: string;
  trigger?: boolean; // when it flips true, the decrypt plays once (boot sequences)
}) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const run = useCallback(() => {
    if (prefersReducedMotion()) return;
    stop();
    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      const settled = Math.floor(step / 2);
      if (settled >= text.length) {
        setDisplay(text);
        stop();
        return;
      }
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        const c = text[i];
        out += c === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
    }, 26);
  }, [text, stop]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (trigger) run();
  }, [trigger, run]);

  return (
    <span className={className} onMouseEnter={run}>
      {display}
    </span>
  );
}
