export type Mode = 'smash' | 'good';
export type Verdict = 'yes' | 'no' | 'super' | 'skip';

/** The slice of a Scryfall card we keep, so summaries render without refetching. */
export interface CardFace {
  name: string;
  typeLine: string;
  image: string;   // full card image (normal size)
  artCrop: string;
  artist?: string;
}

export interface CardSnapshot {
  id: string;
  oracleId: string;
  illustrationId?: string;
  name: string;
  typeLine: string;
  colors: string[];
  artist: string;
  setName: string;
  setCode: string;
  scryfallUri: string;
  faces: CardFace[]; // 1 face for normal cards, 2 for DFCs
}

export interface Round {
  id: string;
  mode: Mode;
  label: string;   // human-readable pool description
  query: string;   // full Scryfall query sent to /cards/random
  length: number;
  artOnly: boolean;
  startedAt: string;
  finishedAt?: string;
}

export interface Vote {
  id: string;
  roundId: string;
  mode: Mode;
  verdict: Verdict;
  card: CardSnapshot;
  decisionMs: number;
  createdAt: string;
}
