'use client';

import confetti from 'canvas-confetti';

export interface ConfettiOptions extends confetti.Options {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: confetti.Shape[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

export const fireConfetti = (options: ConfettiOptions = {}) => {
  return confetti({
    particleCount: options.particleCount ?? 80,
    spread: options.spread ?? 70,
    origin: options.origin ?? { y: 0.65 },
    colors: options.colors ?? ['#7c5cff', '#33d493', '#56a8ff', '#f7b84e', '#ffffff'],
    zIndex: options.zIndex ?? 9999,
    ...options,
  });
};

export const fireRealisticConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
    colors: ['#7c5cff', '#9d86ff', '#33d493', '#56a8ff', '#f7b84e', '#ffffff'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export default confetti;
