# Mahjong Reference

A beginner-first Hong Kong and Taiwanese mahjong reference, built to be used
**live at the table** — not as a study guide.

Landscape-first, dark by default, large tap targets, and every section one tap
away. If a section can't be understood by someone playing their second game
ever, it isn't done.

---

## Running it on your machine

You need [Node.js](https://nodejs.org) 22 or newer. Then, in a terminal:

```bash
npm install     # download the dependencies (once)
npm run dev     # start a local server
```

Open the URL it prints (usually `http://localhost:5173`). Edits to the code
appear in the browser immediately.

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the test suite (game logic + the portability check) |
| `npm run build` | Produces the deployable site in `dist/` |
| `npm run preview` | Serves the built site so you can check it before deploying |

## Putting it online

Hosting is free and needs no server. In the GitHub repo, go to
**Settings → Pages → Build and deployment** and set **Source** to
**GitHub Actions**. From then on, every push to `main` builds and publishes the
site automatically via `.github/workflows/deploy.yml`.

The site will be at `https://<your-username>.github.io/mahjong/`.

> If you rename the repository, update `BASE_PATH` in the workflow to match, or
> the CSS and JavaScript will 404.

---

## How the code is organised

The one architectural rule: **game data and logic never touch the UI.**

```
src/
├── core/          ← Plain TypeScript. No React, no Mantine, no UI at all.
│   ├── tiles.ts           Every tile, and how to recognise it
│   ├── terminology.ts     English / Cantonese / Mandarin name mappings
│   ├── melds.ts           Meld rules and claim priority
│   ├── turnFlow.ts        Turn order, the wall, round/seat wind tracking
│   ├── scorekeeper.ts     Score tracking as a pure reducer
│   ├── scoring/           Faan and tai tables, and payout maths
│   └── core.test.ts       Tests, including the portability check
│
└── app/           ← React + Mantine. Rendering only.
    ├── App.tsx            The shell and navigation
    ├── settings.tsx       Ruleset and terminology choices
    ├── components/        Tile faces, source disclosure
    └── sections/          The five screens
```

**Why the split matters.** Everything in `src/core` is plain data and pure
functions, so it can move into a React Native app without a single change. Only
the `src/app` layer would be rewritten. `core.test.ts` walks the `core`
directory and **fails the build** if anything there imports a UI framework — the
boundary is enforced, not just documented.

The scorekeeper is a reducer over an immutable, serialisable hand log. That
shape is deliberate: when persistence and cross-device sync arrive later, they
slot in underneath without restructuring the app.

### Adding or changing terminology

Never write a game term directly into a component. Add it to the table in
`src/core/terminology.ts` and read it through `useSettings().t('yourKey')`. That
is what makes the language toggle work everywhere at once.

---

## About the rules content

⚠️ **Verify the scoring before you rely on it at a table.**

Mahjong has no governing body. Values genuinely differ between regions, clubs
and households, and the online sources disagree with each other in places.

So no rule in this project was written from memory. Every scoring pattern,
payout rule and procedure carries:

- the **sources** it was drawn from, linked in the app itself,
- a **confidence marker** — `established`, `varies`, or `unverified`,
- and a **note** wherever sources conflict, stating *both* readings rather than
  silently picking one.

Known conflicts already flagged in the data include Full Flush (6 vs 7 faan),
Little Three Dragons, the two Hong Kong discard-payment conventions, and most of
the Taiwanese tai values above 4. A test enforces that anything not marked
`established` explains itself.

In the app, tap **Why?** next to any rule to see its sources.

---

## What's in V1

Turn Flow · Tile Reference · Melds & Actions · Scoring Reference · Scorekeeper,
with ruleset and terminology toggles throughout.

Scorekeeper state is held in memory only — refreshing the page clears it. That
is a deliberate V1 tradeoff.

Designed for but not built: persistence, accounts and cross-device sync,
camera tile recognition, strategy hints, and configurable house rules.
