import { matchPath, NavLink, Route, Routes, useLocation } from 'react-router';
import Welcome from './pages/Welcome';
import Setup from './pages/Setup';
import Play from './pages/Play';
import Summary from './pages/Summary';
import Leaderboard from './pages/Leaderboard';
import { MODE_ORDER, MODES } from './lib/modes';
import { getRound } from './lib/storage';
import type { Mode } from './types';

/** The mode the current page belongs to, so the ambient background can take its colour. */
function useActiveMode(): Mode | undefined {
  const { pathname } = useLocation();
  const setup = matchPath('/setup/:mode', pathname)?.params.mode;
  if (setup && setup in MODES) return setup as Mode;
  const roundId =
    matchPath('/play/:roundId', pathname)?.params.roundId ??
    matchPath('/round/:roundId', pathname)?.params.roundId;
  return roundId ? getRound(roundId)?.mode : undefined;
}

export default function App() {
  const mode = useActiveMode();

  // data-mode switches the whole theme palette (see the [data-mode] blocks in styles.css).
  return (
    <div className="app" data-mode={mode ?? 'home'}>
      <div className="ambient" aria-hidden />
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="sol-ring" aria-hidden />
          <span className="sol">Sol</span> Mates
        </NavLink>
        <nav>
          {MODE_ORDER.map((m) => (
            <NavLink key={m} to={`/setup/${m}`} className={mode === m ? 'active' : undefined}>
              <span aria-hidden>{MODES[m].emoji}</span> {MODES[m].title}
            </NavLink>
          ))}
          <NavLink to="/leaderboard">🏅 Leaderboard</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/setup/:mode" element={<Setup />} />
          <Route path="/play/:roundId" element={<Play />} />
          <Route path="/round/:roundId" element={<Summary />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<p className="center">Page not found.</p>} />
        </Routes>
      </main>

      <footer>
        Card data and images from <a href="https://scryfall.com" target="_blank" rel="noreferrer">Scryfall</a>.
        Sol Mates is unofficial Fan Content permitted under the Fan Content Policy. Not
        approved/endorsed by Wizards. Portions of the materials used are property of Wizards of
        the Coast. ©Wizards of the Coast LLC.
      </footer>
    </div>
  );
}
