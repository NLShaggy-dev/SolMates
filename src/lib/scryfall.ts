import type { CardFace, CardSnapshot } from '../types';

const API = 'https://api.scryfall.com';

/** Applied to every pool: paper cards only, no tokens/emblems/art-series cards. */
export const BASE_FILTER =
  'game:paper -layout:token -layout:double_faced_token -layout:emblem -layout:art_series';

// Scryfall asks for 50–100 ms between requests; serialize all calls through one queue.
const MIN_GAP_MS = 100;
let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;

function throttledFetch(url: string): Promise<Response> {
  const run = async () => {
    const wait = lastRequest + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    return fetch(url, { headers: { Accept: 'application/json' } });
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

export class ScryfallError extends Error {}

async function getJson<T>(url: string): Promise<T> {
  const res = await throttledFetch(url);
  const body = await res.json();
  if (!res.ok) throw new ScryfallError(body?.details ?? `Scryfall error ${res.status}`);
  return body as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toFace(src: any, fallback: any): CardFace {
  const uris = src.image_uris ?? fallback.image_uris ?? {};
  return {
    name: src.name,
    typeLine: src.type_line ?? '',
    image: uris.normal ?? uris.large ?? '',
    artCrop: uris.art_crop ?? uris.normal ?? '',
    artist: src.artist ?? fallback.artist,
  };
}

function toSnapshot(c: any): CardSnapshot {
  // DFCs keep images per face; split/adventure/flip cards keep one image at the top level.
  const faces: CardFace[] =
    c.card_faces && !c.image_uris
      ? c.card_faces.map((f: any) => toFace(f, c))
      : [toFace(c, c)];
  const front = c.card_faces?.[0] ?? c;
  return {
    id: c.id,
    oracleId: c.oracle_id ?? front.oracle_id ?? c.id,
    illustrationId: c.illustration_id ?? front.illustration_id,
    name: c.name,
    typeLine: c.type_line ?? front.type_line ?? '',
    colors: c.colors ?? front.colors ?? [],
    artist: c.artist ?? front.artist ?? 'Unknown artist',
    setName: c.set_name,
    setCode: c.set,
    scryfallUri: c.scryfall_uri,
    faces,
  };
}

export async function randomCard(query: string): Promise<CardSnapshot> {
  const card = await getJson<any>(`${API}/cards/random?q=${encodeURIComponent(query)}`);
  return toSnapshot(card);
}

export interface MtgSet {
  code: string;
  name: string;
  releasedAt: string;
}

let setsCache: Promise<MtgSet[]> | null = null;

export function fetchSets(): Promise<MtgSet[]> {
  setsCache ??= getJson<{ data: any[] }>(`${API}/sets`)
    .then(({ data }) =>
      data
        .filter((s) => !s.digital && s.card_count > 0 && s.set_type !== 'token' && s.set_type !== 'memorabilia')
        .map((s) => ({ code: s.code, name: s.name, releasedAt: s.released_at ?? '' }))
        .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt)),
    )
    .catch((err) => {
      setsCache = null;
      throw err;
    });
  return setsCache;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}
