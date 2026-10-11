import { Link, useParams } from 'react-router';
import { getRound, getVotes } from '../lib/storage';
import { MODES } from '../lib/modes';
import type { Vote } from '../types';

const COLORS: { key: string; name: string }[] = [
  { key: 'W', name: 'White' },
  { key: 'U', name: 'Blue' },
  { key: 'B', name: 'Black' },
  { key: 'R', name: 'Red' },
  { key: 'G', name: 'Green' },
  { key: 'C', name: 'Colorless' },
];

// Checked in priority order, so "Artifact Creature" counts as a Creature.
const TYPES = ['Creature', 'Planeswalker', 'Battle', 'Land', 'Instant', 'Sorcery', 'Artifact', 'Enchantment'];

const isYes = (v: Vote) => v.verdict === 'yes' || v.verdict === 'super';

function mainType(typeLine: string) {
  const front = typeLine.split('//')[0];
  return TYPES.find((t) => front.includes(t)) ?? 'Other';
}

interface Row { label: string; total: number; yes: number }

function breakdown(votes: Vote[], keyOf: (v: Vote) => string[]): Row[] {
  const rows = new Map<string, Row>();
  for (const v of votes) {
    for (const k of keyOf(v)) {
      const row = rows.get(k) ?? { label: k, total: 0, yes: 0 };
      row.total++;
      if (isYes(v)) row.yes++;
      rows.set(k, row);
    }
  }
  return [...rows.values()].sort((a, b) => b.total - a.total);
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export default function Summary() {
  const { roundId = '' } = useParams();
  const round = getRound(roundId);
  if (!round) return <p className="center">Round not found. <Link to="/">Start a new one</Link></p>;

  const mode = MODES[round.mode];
  const votes = getVotes(round.id);
  const counted = votes.filter((v) => v.verdict !== 'skip');
  const yes = counted.filter(isYes).length;
  const supers = votes.filter((v) => v.verdict === 'super');
  const avgMs = votes.length ? votes.reduce((s, v) => s + v.decisionMs, 0) / votes.length : 0;
  const fastest = counted.reduce<Vote | null>((f, v) => (!f || v.decisionMs < f.decisionMs ? v : f), null);

  const byColor = breakdown(counted, (v) => (v.card.colors.length ? v.card.colors : ['C'])).map((r) => ({
    ...r,
    label: COLORS.find((c) => c.key === r.label)?.name ?? r.label,
  }));
  const byType = breakdown(counted, (v) => [mainType(v.card.typeLine)]);

  return (
    <div className="summary">
      <h2>{mode.title} · {round.label}</h2>

      <div className="stat-tiles">
        <div className="tile">
          <strong>{pct(yes, counted.length)}%</strong>
          <span>{mode.labels.yes.toLowerCase()} rate</span>
        </div>
        <div className="tile">
          <strong>{counted.length - yes}</strong>
          <span>{mode.labels.no.toLowerCase()} votes</span>
        </div>
        <div className="tile">
          <strong>{(avgMs / 1000).toFixed(1)}s</strong>
          <span>avg decision</span>
        </div>
        {fastest && (
          <div className="tile">
            <strong>{(fastest.decisionMs / 1000).toFixed(1)}s</strong>
            <span>fastest: {fastest.card.name}</span>
          </div>
        )}
      </div>

      {supers.length > 0 && (
        <section>
          <h3>Hottest picks</h3>
          <div className="grid">
            {supers.map((v) => <Thumb key={v.id} vote={v} artOnly={round.artOnly} label={mode.labels.super} />)}
          </div>
        </section>
      )}

      <div className="breakdowns">
        <Breakdown title="By color" rows={byColor} />
        <Breakdown title="By type" rows={byType} />
      </div>

      <section>
        <h3>Every card</h3>
        <div className="grid">
          {votes.map((v) => <Thumb key={v.id} vote={v} artOnly={round.artOnly} label={mode.labels[v.verdict]} />)}
        </div>
      </section>

      <div className="center">
        <Link className="primary" to={`/setup/${round.mode}`}>Play another round</Link>
      </div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {rows.map((r) => (
        <div key={r.label} className="bar-row">
          <span>{r.label}</span>
          <div className="bar"><div style={{ width: `${pct(r.yes, r.total)}%` }} /></div>
          <span className="muted">{r.yes}/{r.total}</span>
        </div>
      ))}
      {!rows.length && <p className="muted">No votes counted.</p>}
    </section>
  );
}

function Thumb({ vote, artOnly, label }: { vote: Vote; artOnly: boolean; label: string }) {
  const face = vote.card.faces[0];
  return (
    <a className={`thumb verdict-${vote.verdict}`} href={vote.card.scryfallUri} target="_blank" rel="noreferrer">
      <img src={artOnly ? face.artCrop : face.image} alt={vote.card.name} loading="lazy" />
      <span className="badge">{label}</span>
      <span className="thumb-name">{vote.card.name}</span>
      <span className="thumb-artist">{vote.card.artist}</span>
    </a>
  );
}
