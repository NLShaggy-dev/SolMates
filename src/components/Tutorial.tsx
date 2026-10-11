import { useEffect, useState } from 'react';
import { MODES } from '../lib/modes';
import type { Mode } from '../types';

const SEEN_KEY = 'msp.tutorialSeen';

export function tutorialSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Blocked storage just means the tutorial shows again next time.
  }
}

interface Step {
  demo: 'right' | 'left' | 'up' | 'down' | 'keys';
  title: string;
  body: string;
}

function stepsFor(mode: Mode): Step[] {
  const { labels, hasSuper } = MODES[mode];
  const steps: Step[] = [
    { demo: 'right', title: `Swipe right to ${labels.yes.toLowerCase()}`, body: 'Drag the card to the right, or press → or D.' },
    { demo: 'left', title: `Swipe left to ${labels.no.toLowerCase()}`, body: 'Drag it to the left, or press ← or A.' },
  ];
  if (hasSuper) {
    steps.push({ demo: 'up', title: `Swipe up to ${labels.super.toLowerCase()}`, body: 'For the ones you really mean. Drag up, or press ↑ or W.' });
  }
  steps.push(
    { demo: 'down', title: 'Swipe down to skip', body: 'Not feeling it either way? Drag down, or press ↓ or S.' },
    { demo: 'keys', title: 'One more thing', body: 'Double-faced cards get a Flip button (or press F). At the end of the round you get your stats.' },
  );
  return steps;
}

export default function Tutorial({ mode, onDone }: { mode: Mode; onDone: () => void }) {
  const steps = stepsFor(mode);
  const [i, setI] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;
  const { labels } = MODES[mode];

  const finish = () => {
    markSeen();
    onDone();
  };
  const next = () => (last ? finish() : setI(i + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    // Capture phase so the play screen's vote shortcuts never see these keys.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const stampFor = { right: labels.yes, left: labels.no, up: labels.super, down: labels.skip, keys: '' }[step.demo];

  return (
    <div className="tutorial-backdrop" role="dialog" aria-modal aria-labelledby="tutorial-title">
      <div className="tutorial">
        <div className="tutorial-demo">
          <div key={i} className={`demo-card demo-${step.demo}`}>
            {stampFor && <span className={`demo-stamp demo-stamp-${step.demo}`}>{stampFor}</span>}
            {step.demo === 'keys' && <span className="demo-keys">⟲ F</span>}
          </div>
        </div>
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="dots">
          {steps.map((_, n) => <span key={n} className={n === i ? 'on' : ''} />)}
        </div>
        <div className="tutorial-actions">
          <button className="ghost" onClick={finish}>Skip tutorial</button>
          <button className="primary" onClick={next}>{last ? "Let's go" : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
