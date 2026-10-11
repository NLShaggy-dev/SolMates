import { Link } from 'react-router';
import { getRounds } from '../lib/storage';
import { COMING_SOON, MODE_ORDER, MODES } from '../lib/modes';
import type { CSSProperties } from 'react';

export default function Welcome() {
  const recent = getRounds()
    .filter((r) => r.finishedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 6);

  return (
    <div className="welcome">
      <header className="hero">
        <span className="hero-ring" aria-hidden />
        <h1><span className="sol">Sol</span> Mates</h1>
        <p className="tagline">Find your one true card.</p>
        <p className="intro">
          Random Magic cards, one at a time. Swipe right, swipe left, and see what your taste says
          about you at the end of every round.
        </p>
        <Link className="primary big" to="/setup/smash">Start swiping</Link>
      </header>

      <section>
        <h2 className="section-title">Pick a mode</h2>
        <div className="mode-grid">
          {MODE_ORDER.map((m) => (
            <Link
              key={m}
              to={`/setup/${m}`}
              className="mode-tile"
              style={{ '--tile': MODES[m].accent } as CSSProperties}
            >
              <span className="mode-emoji">{MODES[m].emoji}</span>
              <strong>{MODES[m].title}</strong>
              <p>{MODES[m].blurb}</p>
              <span className="mode-go">Play →</span>
            </Link>
          ))}
          {COMING_SOON.map((m) => (
            <div key={m.title} className="mode-tile soon">
              <span className="mode-emoji">{m.emoji}</span>
              <strong>{m.title}</strong>
              <p>{m.blurb}</p>
              <span className="mode-go">Coming soon</span>
            </div>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="section-title">Your recent rounds</h2>
          <ul className="recent panel">
            {recent.map((r) => (
              <li key={r.id}>
                <Link to={`/round/${r.id}`}>
                  {MODES[r.mode].emoji} {MODES[r.mode].title} · {r.label} · {r.length} cards
                </Link>
                <time>{new Date(r.startedAt).toLocaleDateString()}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
