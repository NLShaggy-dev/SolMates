# Sol Mates

*Find your one true card.*

Sol Mates is a swipe game for Magic: The Gathering cards. You get random cards one at a time, swipe right or left, and see what your choices say about you at the end of each round.

> **Heads up: this project was built almost entirely by AI.**
> The code, styling, copy and joke prompts were written by an AI coding assistant (Claude, via Claude Code). A human provided the idea, made the product and design decisions, steered each iteration, and play-tested the result. The code has not been audited line by line by a human. Treat it as a hobby prototype, not production software.

---

## Game modes

| Mode | What you're judging | Votes |
|---|---|---|
| 💘 **Smash or Pass** | The meme classic. Would you? | Smash, Pass, Super Smash, Skip |
| 🧠 **Good or Not** | Is this a good card? Your gut call, no looking it up. | Good, Bad, Skip |

The welcome page also shows two **coming soon** modes, *Card Bracket* and *Daily Date*. They are placeholders only and are not implemented.

## Features

- **Rounds:** choose a card pool and a round length (10, 20 or 30 cards), then play.
- **Card pools:**
  - Anything (any paper card, excluding tokens, emblems and art-series cards)
  - Suggestive art, from the Scryfall Tagger tag [`sexually-suggestive`](https://tagger.scryfall.com/tags/artwork/sexually-suggestive)
  - A specific set, chosen from Scryfall's full set list
- **Art-only toggle:** shows just the illustration instead of the whole card.
- **Three ways to vote:**
  - Drag or swipe the card (right, left, up or down)
  - On-screen buttons
  - Keyboard: `←/A` pass, `→/D` smash, `↑/W` super smash, `↓/S` skip, `F` flip a double-faced card
- **Vote effects:**
  - While you drag, the stamp and a glow build up.
  - Smash: a burst of hearts.
  - Super Smash: a launch, shockwave, screen flash and shake.
  - Animations are reduced when the OS "reduce motion" setting is on.
- **Double-faced cards:** you vote on the front face and can flip to see the back.
- **Rotating prompts:** a different joke headline for each card.
- **Round summary:**
  - Yes rate, average and fastest decision time
  - Your super smashes
  - Breakdowns by color and by card type
  - A grid of every card you voted on, linked to Scryfall
- **First-round tutorial:** can be reopened with the `?` button.
- **Per-mode themes:** plum and rose for Smash, slate and green for Good. They cross-fade when you switch modes.
- **Artist credit:** every card shows its artist and links to its Scryfall page.

## Current limitations

This is an MVP. Known gaps:

- **Votes are stored only in your browser.** Rounds and votes live in `localStorage`. There is no account, sync or export, and clearing site data erases your history.
- **There is no global leaderboard.** The Leaderboard page is a placeholder until a backend exists, so you can't see how other people voted.
- **Cards can repeat.** Each card comes from Scryfall's random endpoint, so the same card or art (including reprints) can show up more than once, even in the same round.
- **Pool options are limited.** There is no raw Scryfall query box, multi-set selection or color/type filters yet.
- **"Suggestive art" depends on community tagging.** It uses Scryfall Tagger data, which may be incomplete or debatable. There is no age gate. Official MTG art is generally tame, but use your judgment before sharing.
- **Good or Not is pure opinion.** It doesn't compare your vote with real data such as EDHREC rank, price or format legality.
- **Requires an internet connection.** Cards and images load live from the Scryfall API. If Scryfall is down or rate-limits you, the round shows an error with a retry button.
- **Desktop-first.** It works in mobile browsers with touch swiping, but there is no native app and no installable PWA.
- **No automated tests or linting.** All testing so far has been manual, in a Chromium-based browser only. Other browsers (especially older Safari) may have visual quirks; the theme transitions use `@property` and `color-mix()`.
- **Accessibility has not been audited.** Keyboard play works, but screen-reader support hasn't been reviewed.
- **Not deployed yet.** No public instance exists.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/) (`HashRouter`, so deep links work on static hosts)
- [Scryfall API](https://scryfall.com/docs/api) for card data and images, called directly from the browser
- Inter and Space Grotesk variable fonts, bundled via Fontsource so no requests go to Google Fonts
- Plain CSS with no UI framework

There is no backend: the whole app is a static site.

## Getting started

Requires **Node.js 20+** (developed on Node 26).

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Other scripts:

```bash
npm run build     # type-check and build to dist/
npm run preview   # serve the production build locally
```

## Deploying

`npm run build` outputs a fully static site to `dist/`. The build is set up for any static host:

- `base: './'` in `vite.config.ts` makes asset paths relative, so it works under a subpath such as GitHub Pages (`username.github.io/repo/`).
- `HashRouter` means no server rewrite rules are needed.

For GitHub Pages, publish the `dist/` folder, for example with a GitHub Actions workflow that runs `npm ci && npm run build` and deploys `dist/`.

## Project structure

```
src/
  App.tsx               Layout, nav, routes, and picking the theme from the current mode
  main.tsx              Entry point (router, fonts, global CSS)
  styles.css            All styling, including per-mode themes and vote effects
  types.ts              Round, Vote and CardSnapshot types
  lib/
    modes.ts            Mode registry: titles, labels, prompts, coming-soon modes
    scryfall.ts         Throttled Scryfall client and card normalization
    storage.ts          localStorage persistence for rounds and votes
  components/
    SwipeCard.tsx       Draggable card, stamp, drag build-up
    Effects.tsx         Particle bursts and shockwave
    Tutorial.tsx        First-round tutorial overlay
  pages/
    Welcome.tsx         Landing page and mode grid
    Setup.tsx           Per-mode round setup
    Play.tsx            The swipe screen
    Summary.tsx         End-of-round stats
    Leaderboard.tsx     Placeholder
SPEC.md                 Product spec and backlog
```

### Adding a mode

Add an entry to `MODES` and `MODE_ORDER` in `src/lib/modes.ts`. It then appears automatically in the nav, the welcome grid and the setup page. To give it its own theme, add an `.app[data-mode='your-mode']` block in `styles.css`.

## Data and privacy

- Your votes never leave your browser.
- The only network requests go to `api.scryfall.com` and `cards.scryfall.io`, for card data and images.
- Requests are queued at least 100 ms apart, following Scryfall's API guidelines.

## Roadmap

These are ideas, not commitments. See [SPEC.md](SPEC.md) for the full backlog.

- A global backend: crowd vote percentages per card and a real leaderboard
- Card Bracket mode (head-to-head knockout rounds)
- A shareable "My top 10 smashes" image or link
- A raw Scryfall query box and more art-tag presets
- Real data in Good or Not: compare your verdict with EDHREC rank, price and legality
- Prompts that react to the card, plus an opt-in spicier set of lines
- Avoiding repeats across rounds
- Tests and CI

## Legal

Sol Mates is unofficial Fan Content permitted under the [Wizards of the Coast Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy). Not approved or endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

Card data and images are provided by [Scryfall](https://scryfall.com). This project is not produced by or affiliated with Scryfall. Card images are shown with artist credit and are never sold or paywalled. Under the Fan Content Policy, this project must stay free.

All card artwork belongs to its respective artists and Wizards of the Coast.

## License

The source code is released under the [MIT License](LICENSE).

The license covers this project's code only. It grants no rights to Magic: The Gathering card images, names, text or other Wizards of the Coast material, or to data from Scryfall. Those remain the property of their owners and are used under the Fan Content Policy and Scryfall's guidelines described above.
