import { useState, type CSSProperties } from 'react';
import type { Verdict } from '../types';

export interface Burst {
  id: number;
  verdict: Verdict;
}

interface BurstConfig {
  count: number;
  emojis: string[];
  angle: number;   // centre direction in degrees (0 = right, -90 = up)
  spread: number;  // total arc in degrees
  dist: [number, number];
  size: [number, number];
}

// Escalating: pass is a puff of dust, smash a handful of hearts, super smash an explosion.
const CONFIG: Partial<Record<Verdict, BurstConfig>> = {
  no: { count: 6, emojis: ['💨'], angle: 180, spread: 70, dist: [60, 130], size: [0.8, 1.3] },
  yes: { count: 14, emojis: ['💚', '💖', '✨'], angle: -45, spread: 150, dist: [90, 190], size: [0.9, 1.5] },
  super: { count: 36, emojis: ['💜', '💖', '🔥', '✨', '💘', '😍'], angle: -90, spread: 360, dist: [140, 340], size: [1.2, 2.4] },
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeParticles(cfg: BurstConfig) {
  return Array.from({ length: cfg.count }, (_, i) => {
    const a = ((cfg.angle + rand(-cfg.spread / 2, cfg.spread / 2)) * Math.PI) / 180;
    const d = rand(...cfg.dist);
    return {
      emoji: cfg.emojis[i % cfg.emojis.length],
      style: {
        '--x': `${Math.cos(a) * d}px`,
        '--y': `${Math.sin(a) * d}px`,
        '--r': `${rand(-200, 200)}deg`,
        '--s': rand(...cfg.size).toFixed(2),
        animationDelay: `${rand(0, 120)}ms`,
        animationDuration: `${rand(700, 1100)}ms`,
      } as CSSProperties,
    };
  });
}

function BurstView({ verdict }: { verdict: Verdict }) {
  const cfg = CONFIG[verdict];
  // Randomised once per burst so re-renders don't reshuffle the particles mid-flight.
  const [particles] = useState(() => (cfg ? makeParticles(cfg) : []));
  return (
    <>
      {verdict === 'super' && <div className="ring" />}
      {particles.map((p, i) => (
        <span key={i} className="particle" style={p.style}>{p.emoji}</span>
      ))}
    </>
  );
}

export default function Effects({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="effects" aria-hidden>
      {bursts.map((b) => <BurstView key={b.id} verdict={b.verdict} />)}
    </div>
  );
}
