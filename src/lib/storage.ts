import type { Round, Vote } from '../types';

// Local-first persistence. Every record has a uuid + timestamp so it can sync to a backend later.
const ROUNDS_KEY = 'msp.rounds';
const VOTES_KEY = 'msp.votes';

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the round still plays, it just won't persist.
  }
}

export const getRounds = () => read<Round>(ROUNDS_KEY);
export const getRound = (id: string) => getRounds().find((r) => r.id === id);

export function saveRound(round: Round) {
  const rounds = getRounds().filter((r) => r.id !== round.id);
  write(ROUNDS_KEY, [...rounds, round]);
}

export const getVotes = (roundId: string) => read<Vote>(VOTES_KEY).filter((v) => v.roundId === roundId);

export function addVote(vote: Vote) {
  write(VOTES_KEY, [...read<Vote>(VOTES_KEY), vote]);
}

export const uuid = () => crypto.randomUUID();
