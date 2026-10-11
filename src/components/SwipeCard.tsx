import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { CardSnapshot, Mode, Verdict } from '../types';
import { MODES } from '../lib/modes';

const THRESHOLD = 110;

interface Props {
  card: CardSnapshot;
  faceIndex: number;
  artOnly: boolean;
  mode: Mode;
  exiting: Verdict | null;
  onVote: (v: Verdict) => void;
}

function verdictFor(dx: number, dy: number, hasSuper: boolean): Verdict | null {
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > THRESHOLD) return 'yes';
    if (dx < -THRESHOLD) return 'no';
  } else {
    if (dy < -THRESHOLD && hasSuper) return 'super';
    if (dy > THRESHOLD) return 'skip';
  }
  return null;
}

/** Which way the card is leaning and how close (0–1+) it is to committing, for the drag build-up. */
function leanFor(dx: number, dy: number, hasSuper: boolean): { verdict: Verdict; progress: number } | null {
  if (Math.hypot(dx, dy) < 15) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return { verdict: dx > 0 ? 'yes' : 'no', progress: Math.abs(dx) / THRESHOLD };
  if (dy < 0) return hasSuper ? { verdict: 'super', progress: -dy / THRESHOLD } : null;
  return { verdict: 'skip', progress: dy / THRESHOLD };
}

export default function SwipeCard({ card, faceIndex, artOnly, mode, exiting, onVote }: Props) {
  const [drag, setDrag] = useState({ dx: 0, dy: 0, active: false });
  const start = useRef({ x: 0, y: 0 });
  const { labels, hasSuper } = MODES[mode];
  const face = card.faces[faceIndex] ?? card.faces[0];

  const onDown = (e: PointerEvent) => {
    if (exiting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ dx: 0, dy: 0, active: true });
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.active) return;
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, active: true });
  };
  const onUp = () => {
    if (!drag.active) return;
    const v = verdictFor(drag.dx, drag.dy, hasSuper);
    setDrag((d) => ({ ...d, active: false }));
    if (v) onVote(v);
    else setDrag({ dx: 0, dy: 0, active: false });
  };

  const lean = exiting ? { verdict: exiting, progress: 1 } : leanFor(drag.dx, drag.dy, hasSuper);
  const stamp = lean?.verdict;
  const p = Math.min(1, lean?.progress ?? 0);
  const style = {
    '--p': p.toFixed(3),
    ...(exiting ? {} : { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 18}deg)` }),
  } as CSSProperties;
  const leanClass = lean ? `lean-${lean.verdict}` : '';
  const locked = (lean?.progress ?? 0) >= 1 ? 'locked' : '';

  return (
    <div
      className={`swipe-card ${drag.active ? 'dragging' : ''} ${exiting ? `exit-${exiting}` : ''} ${leanClass}`}
      style={style}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <img
        src={artOnly ? face.artCrop : face.image}
        alt={face.name}
        draggable={false}
        className={artOnly ? 'art' : 'full'}
      />
      {stamp && <div className={`stamp stamp-${stamp} ${locked}`}>{labels[stamp]}</div>}
    </div>
  );
}
