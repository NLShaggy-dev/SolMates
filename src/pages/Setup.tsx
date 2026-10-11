import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { BASE_FILTER, fetchSets, type MtgSet } from '../lib/scryfall';
import { saveRound, uuid } from '../lib/storage';
import { MODES } from '../lib/modes';
import type { Mode } from '../types';

type Pool = 'anything' | 'suggestive' | 'set';

const LENGTHS = [10, 20, 30];

export default function Setup() {
  const { mode = '' } = useParams();
  if (!(mode in MODES)) return <Navigate to="/" replace />;
  return <SetupForm key={mode} mode={mode as Mode} />;
}

function SetupForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const info = MODES[mode];
  const [pool, setPool] = useState<Pool>('anything');
  const [sets, setSets] = useState<MtgSet[]>([]);
  const [setsError, setSetsError] = useState<string | null>(null);
  const [setInput, setSetInput] = useState('');
  const [length, setLength] = useState(10);
  const [artOnly, setArtOnly] = useState(false);

  useEffect(() => {
    if (pool !== 'set' || sets.length) return;
    fetchSets().then(setSets, (e) => setSetsError(e.message));
  }, [pool, sets.length]);

  // The datalist shows "Name (CODE)"; resolve the typed value back to a set.
  const chosenSet = useMemo(() => {
    const v = setInput.trim().toLowerCase();
    return sets.find((s) => `${s.name} (${s.code})`.toLowerCase() === v || s.code === v);
  }, [setInput, sets]);

  const canStart = pool !== 'set' || !!chosenSet;

  const start = () => {
    let extra = '';
    let label = 'Anything';
    if (pool === 'suggestive') {
      extra = 'art:sexually-suggestive';
      label = 'Suggestive art';
    } else if (pool === 'set' && chosenSet) {
      extra = `set:${chosenSet.code}`;
      label = chosenSet.name;
    }
    const round = {
      id: uuid(),
      mode,
      label,
      query: `${BASE_FILTER} ${extra}`.trim(),
      length,
      artOnly,
      startedAt: new Date().toISOString(),
    };
    saveRound(round);
    navigate(`/play/${round.id}`);
  };

  return (
    <div className="setup">
      <Link to="/" className="back">← All modes</Link>
      <header className="setup-head">
        <span className="mode-emoji">{info.emoji}</span>
        <div>
          <h1>{info.title}</h1>
          <p>{info.blurb}</p>
        </div>
      </header>

      <section className="panel">
        <h3>Card pool</h3>
        <div className="pills">
          <label><input type="radio" checked={pool === 'anything'} onChange={() => setPool('anything')} /> Anything</label>
          <label><input type="radio" checked={pool === 'suggestive'} onChange={() => setPool('suggestive')} /> Suggestive art</label>
          <label><input type="radio" checked={pool === 'set'} onChange={() => setPool('set')} /> Specific set</label>
        </div>
        {pool === 'set' && (
          <div className="set-picker">
            <input
              list="sets"
              placeholder={sets.length ? 'Type a set name or code…' : 'Loading sets…'}
              value={setInput}
              onChange={(e) => setSetInput(e.target.value)}
            />
            <datalist id="sets">
              {sets.map((s) => (
                <option key={s.code} value={`${s.name} (${s.code})`} />
              ))}
            </datalist>
            {setsError && <p className="error">{setsError}</p>}
          </div>
        )}

        <h3>Round length</h3>
        <div className="pills">
          {LENGTHS.map((n) => (
            <label key={n}><input type="radio" checked={length === n} onChange={() => setLength(n)} /> {n} cards</label>
          ))}
        </div>

        <h3>Display</h3>
        <label className="toggle">
          <input type="checkbox" checked={artOnly} onChange={(e) => setArtOnly(e.target.checked)} />
          Art only (hide the card frame)
        </label>

        <button className="primary start" disabled={!canStart} onClick={start}>
          Start round
        </button>
      </section>
    </div>
  );
}
