const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export interface ScrambleOptions {
  minSwaps?: number;
  maxSwaps?: number;
  stepDelay?: number;
}

export function scrambleChar(
  span: HTMLElement | null,
  targetChar: string,
  options?: ScrambleOptions
) {
  if (!span) return;
  if (targetChar === ' ') return;

  const minSwaps = options?.minSwaps ?? 2;
  const maxSwaps = options?.maxSwaps ?? 3;
  const stepDelay = options?.stepDelay ?? 75;

  const el = span as HTMLElement & { _cancelScramble?: () => void };
  if (el._cancelScramble) {
    el._cancelScramble();
  }

  const totalSwaps =
    Math.floor(Math.random() * (maxSwaps - minSwaps + 1)) + minSwaps;
  let currentSwap = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  el._cancelScramble = () => {
    if (timer) clearTimeout(timer);
    el.textContent = targetChar;
    delete el._cancelScramble;
  };

  function next() {
    if (currentSwap < totalSwaps) {
      currentSwap++;
      let rand = CHARS[Math.floor(Math.random() * CHARS.length)];
      if (rand === targetChar) {
        rand = CHARS[(CHARS.indexOf(rand) + 1) % CHARS.length];
      }
      el.textContent = rand;
      timer = setTimeout(next, stepDelay);
    } else {
      el.textContent = targetChar;
      delete el._cancelScramble;
    }
  }

  next();
}
