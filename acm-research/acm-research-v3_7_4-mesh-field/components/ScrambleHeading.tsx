import React, { useMemo, useRef, useEffect } from 'react';
import { scrambleChar } from '../hooks/useScrambleText';

interface ScrambleHeadingProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  minSwaps?: number;
  maxSwaps?: number;
  stepDelay?: number;
}

export const ScrambleHeading: React.FC<ScrambleHeadingProps> = ({
  text,
  as: Tag = 'h1',
  className = '',
  minSwaps = 2,
  maxSwaps = 3,
  stepDelay = 75, // fast & snappy (~75ms per character swap)
}) => {
  const chars = useMemo(() => Array.from(text), [text]);
  const overlays = useRef<(HTMLElement | null)[]>([]);

  // On mount: quick staggered reveal across letters
  useEffect(() => {
    const MOUNT_STAGGER = 40; // ms between each char starting on mount
    const timers = overlays.current.map((span, i) => {
      if (!span || chars[i] === ' ') return null;
      return setTimeout(() => {
        scrambleChar(span, chars[i], { minSwaps, maxSwaps, stepDelay });
      }, i * MOUNT_STAGGER);
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
      overlays.current.forEach((span) => {
        if (span && (span as any)._cancelScramble) {
          (span as any)._cancelScramble();
        }
      });
    };
  }, [chars, minSwaps, maxSwaps, stepDelay]);

  return (
    <Tag className={className} aria-label={text}>
      {/* Screen-reader / SEO text */}
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {text}
      </span>

      {/* Visual layer */}
      <span
        aria-hidden="true"
        className="inline-flex whitespace-pre"
        style={{
          letterSpacing: 'inherit',
          lineHeight: 'inherit',
          whiteSpace: 'pre',
        }}
      >
        {chars.map((char, i) => {
          if (char === ' ') {
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: '0.36em',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {'\u00A0'}
              </span>
            );
          }

          return (
            <span
              key={i}
              ref={(el) => {
                overlays.current[i] = el;
              }}
              data-scramble-char
              style={{
                display: 'inline-block',
                position: 'relative',
                pointerEvents: 'auto',
                cursor: 'default',
                minWidth: '0.58em',
                textAlign: 'center',
              }}
              onMouseEnter={() => {
                // Only THIS character scrambles with 2-3 fast random swaps
                scrambleChar(overlays.current[i], char, {
                  minSwaps,
                  maxSwaps,
                  stepDelay,
                });
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </Tag>
  );
};

export default ScrambleHeading;
