import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import SwipeCard from '../components/SwipeCard';
import Effects, { type Burst } from '../components/Effects';
import Tutorial, { tutorialSeen } from '../components/Tutorial';
import { preloadImage, randomCard } from '../lib/scryfall';
import { addVote, getRound, getVotes, saveRound, uuid } from '../lib/storage';
import { MODES } from '../lib/modes';
import type { CardSnapshot, Round, Verdict } from '../types';

const BUFFER = 4; // current card + 3 prefetched
// Super smash gets a longer wind-up so its launch reads as a bigger moment.
const EXIT_MS: Record<Verdict, number> = { yes: 260, no: 260, skip: 260, super: 560 };
const BURST_MS = 1400;
let burstSeq = 0;

/** Classic question first, then the rest shuffled so nothing repeats until the list runs out. */
function promptOrder(prompts: string[]) {
  const [first, ...rest] = prompts;
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export default function Play() {
  const { roundId = '' } = useParams();
  const round = getRound(roundId);
  if (!round) return <p className="center">Round not found. <Link to="/">Start a new one</Link></p>;
  if (round.finishedAt) return <p className="center">This round is finished. <Link to={`/round/${round.id}`}>See results</Link></p>;
  // Keyed so switching rounds resets the card buffer instead of reusing the old round's cards.
  return <PlayRound key={round.id} round={round} />;
}

function PlayRound({ round }: { round: Round }) {
  const navigate = useNavigate();
  const mode = MODES[round.mode];
  const [voted, setVoted] = useState(() => getVotes(round.id).length);
  const [buffer, setBuffer] = useState<CardSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [faceIndex, setFaceIndex] = useState(0);
  const [exiting, setExiting] = useState<Verdict | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shaking, setShaking] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => !tutorialSeen());
  const [prompts] = useState(() => promptOrder(mode.prompts));
  const inflight = useRef(0);
  const shownAt = useRef(performance.now());

  const remaining = round.length - voted;
  const current = buffer[0];

  // Keep the buffer topped up; images are preloaded so swipes never wait on the network.
  useEffect(() => {
    if (error) return;
    const want = Math.min(BUFFER, remaining) - buffer.length - inflight.current;
    for (let i = 0; i < want; i++) {
      inflight.current++;
      randomCard(round.query)
        .then(async (card) => {
          const face = card.faces[0];
          await preloadImage(round.artOnly ? face.artCrop : face.image);
          inflight.current--;
          setBuffer((b) => [...b, card]);
        })
        .catch((e: Error) => {
          inflight.current--;
          setError(e.message);
        });
    }
  }, [buffer.length, remaining, error, round.query, round.artOnly]);

  useEffect(() => {
    shownAt.current = performance.now();
    setFaceIndex(0);
  }, [current?.id, voted, showTutorial]); // restart the decision timer once the tutorial closes

  const vote = useCallback(
    (verdict: Verdict) => {
      if (!current || exiting || showTutorial) return;
      if (verdict === 'super' && !mode.hasSuper) return;
      const decisionMs = Math.round(performance.now() - shownAt.current);
      setExiting(verdict);
      const burst = { id: ++burstSeq, verdict };
      setBursts((b) => [...b, burst]);
      setTimeout(() => setBursts((b) => b.filter((x) => x !== burst)), BURST_MS);
      if (verdict === 'super') {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
      setTimeout(() => {
        addVote({
          id: uuid(),
          roundId: round.id,
          mode: round.mode,
          verdict,
          card: current,
          decisionMs,
          createdAt: new Date().toISOString(),
        });
        setExiting(null);
        setBuffer((b) => b.slice(1));
        setVoted((n) => n + 1);
        if (voted + 1 >= round.length) {
          saveRound({ ...round, finishedAt: new Date().toISOString() });
          navigate(`/round/${round.id}`);
        }
      }, EXIT_MS[verdict]);
    },
    [current, exiting, showTutorial, mode.hasSuper, round, voted, navigate],
  );

  const canFlip = !!current && current.faces.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowright' || k === 'd') vote('yes');
      else if (k === 'arrowleft' || k === 'a') vote('no');
      else if (k === 'arrowup' || k === 'w') vote('super');
      else if (k === 'arrowdown' || k === 's') vote('skip');
      else if (k === 'f' && canFlip) setFaceIndex((i) => (i + 1) % 2);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [vote, canFlip]);

  const face = current?.faces[faceIndex] ?? current?.faces[0];

  return (
    <>
    {/* Outside .play: its shake transform would otherwise trap the fixed-position flash. */}
    {bursts.filter((b) => b.verdict === 'super').map((b) => <div key={b.id} className="flash" />)}
    {showTutorial && <Tutorial mode={round.mode} onDone={() => setShowTutorial(false)} />}
    <div className={`play ${shaking ? 'shake' : ''}`}>
      <div className="play-head">
        <span>{mode.title} · {round.label}</span>
        <span>
          {Math.min(voted + 1, round.length)} / {round.length}
          <button className="help" onClick={() => setShowTutorial(true)} aria-label="Show tutorial">?</button>
        </span>
      </div>
      <div className="progress"><div style={{ width: `${(voted / round.length) * 100}%` }} /></div>
      <h2 key={voted} className="question">{prompts[voted % prompts.length]}</h2>

      <div className="stage">
        {error ? (
          <div className="error-box">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Try again</button>
          </div>
        ) : current ? (
          <SwipeCard
            key={voted}
            card={current}
            faceIndex={faceIndex}
            artOnly={round.artOnly}
            mode={round.mode}
            exiting={exiting}
            onVote={vote}
          />
        ) : (
          <div className="loading">Shuffling the library…</div>
        )}
        <Effects bursts={bursts} />
      </div>

      {current && face && (
        <div className="card-meta">
          <a href={current.scryfallUri} target="_blank" rel="noreferrer">{face.name}</a>
          <span>Illustrated by {face.artist ?? current.artist} · {current.setName}</span>
          {canFlip && (
            <button className="flip" onClick={() => setFaceIndex((i) => (i + 1) % 2)}>
              ⟲ Flip (F)
            </button>
          )}
        </div>
      )}

      <div className="actions">
        <button className="vote no" onClick={() => vote('no')} disabled={!current}>{mode.labels.no}</button>
        <button className="vote skip" onClick={() => vote('skip')} disabled={!current}>{mode.labels.skip}</button>
        {mode.hasSuper && (
          <button className="vote super" onClick={() => vote('super')} disabled={!current}>{mode.labels.super}</button>
        )}
        <button className="vote yes" onClick={() => vote('yes')} disabled={!current}>{mode.labels.yes}</button>
      </div>
      <p className="hint">
        Drag the card, or use ← → {mode.hasSuper ? '↑ ' : ''}↓ (or A D {mode.hasSuper ? 'W ' : ''}S)
      </p>
    </div>
    </>
  );
}
