# Sol Mates — MVP Spec

*Find your one true card.* (Formerly "MTG Smash or Pass.")

A web SPA where players go through rounds of Magic: The Gathering cards and vote on each one. The tone is playful, and every card credits its artist.

## Stack & hosting
- **Vite + React + TypeScript**, built as a static site (GitHub Pages, Netlify or Vercel).
- No backend in the MVP. Votes are stored locally, and the data model is designed so it can sync to a backend later.
- Desktop-first website, responsive enough to work in a mobile browser. No native app.

## Game modes
| Mode | Question | Buttons |
|---|---|---|
| **Smash or Pass** | "Would you?" (the joke mode) | SMASH / PASS (+ Super Smash, Skip) |
| **Good or Not** | "Is this a good card?" (your opinion) | GOOD / BAD (+ Skip) |

Each mode keeps its own vote history and stats.

## Round flow
1. **Setup screen**
   - Mode: Smash or Good.
   - Pool, choose one (MVP):
     - **Anything**: no extra filter, just the base filters below.
     - **Suggestive art**: `art:sexually-suggestive` (Scryfall Tagger tag).
     - **Specific set**: set picker filled from Scryfall `/sets`, which runs `set:<code>`.
     - (Later) more presets and a raw Scryfall query box.
   - Round length: 10 / 20 / 30 cards.
   - **Art-only toggle**: shows `art_crop` instead of the full card image.
2. **Play screen**: one card at a time. Input methods:
   - Drag or swipe the card left/right (up for Super Smash).
   - Large on-screen buttons.
   - Keyboard: ←/A = pass, →/D = smash, ↑/W = super smash, ↓/S = skip, F = flip DFC.
   - A stamp animation (SMASH / PASS / GOOD / BAD) on each vote.
3. **Round summary**: smash/good rate, hottest pick (the super smashes), color and type breakdown, average decision time, plus a thumbnail grid of every card with your verdict.

## Card data (Scryfall)
- `GET /cards/random?q=<query>`, one call per card.
- **Prefetch** the next 3 cards and preload their images, so swiping never waits.
- Keep at least 100 ms between requests, as Scryfall's rate guidance asks. Browsers can't set a custom User-Agent, so that requirement doesn't apply here.
- Duplicates are not handled; random is random.
- **Double-faced cards**: show the front face and add a flip button. Images come from `card_faces[n].image_uris`.
- Art tags use Scryfall's `art:` (also written `atag:`) search keyword, e.g. `art:dragon` or `art:sexually-suggestive`. Tagger tags at tagger.scryfall.com can feed later presets.
- Base filters applied to every query: `-is:digital -t:token -layout:art_series game:paper`. Each one can be overridden in raw mode.

## Local data model (designed for a future sync)
```ts
type Vote = {
  id: string;            // uuid
  mode: 'smash' | 'good';
  verdict: 'yes' | 'no' | 'super' | 'skip';
  cardId: string;        // scryfall id
  oracleId: string;
  illustrationId?: string;
  roundId: string;
  decisionMs: number;
  createdAt: string;     // ISO
};
type Round = { id; mode; query; label; length; startedAt; finishedAt?; };
```
Stored in localStorage (or IndexedDB if it grows). Each record carries a uuid and a timestamp so it can be pushed to a server later.

## Pages / routes
- `/` Welcome: hero, mode grid (playable and coming-soon modes), recent rounds
- `/setup/:mode` Round setup for one mode
- `/play/:id` Active round (shows a tutorial the first time; "?" reopens it)
- `/round/:id` Round summary (past rounds can be revisited)
- `/leaderboard` **Stub** that says "Global leaderboard coming soon"

## Legal / etiquette
- Display the artist name on every card, required when using `art_crop`.
- Never crop out or cover the copyright line on full-card images.
- Include the Wizards of the Coast Fan Content Policy disclaimer in the footer. The site must stay free and non-commercial.
- Link each card to its Scryfall page.

## Post-MVP backlog
- Global backend (Supabase or Firebase): crowd % per card, global leaderboard, "most smashed of all time".
- Bracket/tournament rounds.
- Sharing: "My top 10 smashes" image or link.
- Personal stats and taste profile page.
- More art-tag presets from Scryfall Tagger.
- "Reality" data in Good mode (EDHREC rank, price, legality).
- Avoid repeats across rounds.
- Vote history grid where you can change votes.

## Decisions
- MVP ships with stamp animations only. Humor quips and the humor-level setting move to the backlog.
