import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSimulatedProgress
 * Drives a realistic fake progress bar that:
 *   - Rushes from 0 → ~75% quickly (first 40% of time)
 *   - Slows dramatically from 75% → 92% (waiting for real load)
 *   - Jumps to 100% when complete() is called
 *
 * @param {boolean} running  — start/stop the simulation
 * @param {number}  duration — expected load time in ms (default 5000)
 * @returns {{ progress: number, complete: function }}
 */
export function useSimulatedProgress(running, duration = 5000) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    completedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Animate quickly to 100
    let current = 0;
    setProgress((prev) => { current = prev; return prev; });
    const rushToEnd = () => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 3);
      });
    };
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(100, prev + 4);
      });
    }, 20);
  }, []);

  const reset = useCallback(() => {
    completedRef.current = false;
    startTimeRef.current = null;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!running) { reset(); return; }

    completedRef.current = false;
    startTimeRef.current = null;
    setProgress(0);

    const tick = (now) => {
      if (completedRef.current) return;

      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration); // 0 → 1 over `duration` ms

      // Eased curve: fast start, slow finish, stalls before 95%
      // Uses an asymptotic curve that never quite reaches the cap
      const easedT = 1 - Math.pow(1 - t, 2.2);
      const simulatedPct = Math.min(92, easedT * 92); // Never exceeds 92% on its own

      setProgress(Math.round(simulatedPct));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, duration, reset]);

  return { progress, complete, reset };
}
