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

**Hong Kong scoring is transcribed from primary sources.** The hand values come
from the *Hong Kong Mahjong Rule Sheet* (香港麻雀正統牌型) v1.0, 3 April 2025, by
/u/danma — the PDFs supplied by the project owner. That includes its structural
rule that indented hands **replace** their parent rather than adding to it (a
Full Flush replaces a Mixed Flush), which is modelled as `replaces` in the data
so the app can't double-count.

### Two Hong Kong payment systems

Hong Kong tables use one of two payment systems, and the app supports both. The
choice decides **both** the points chart and who pays what — they're a matched
pair, which is why they're one setting rather than two:

| | New Style (出銃包三家) | Classical |
| --- | --- | --- |
| Chart | Steep, every faan priced separately | Flatter, banded (4-6 all pay 16) |
| 5 faan | 24 points | 16 points |
| 13+ faan | 384 points | 128 points |
| Off a discard | Discarder alone pays, at **double** | Everyone pays; discarder's doubles |
| Self-draw | All three pay face value | Everyone pays, **all doubled** |
| Dealer | No effect | Dealer wins → all payments double. Dealer loses → dealer's doubles |

Classical doublings **stack multiplicatively**. A dealer who deals into a
self-drawn hand pays 4× the base; the worked example in the app shows this on a
real hand rather than asking you to do the arithmetic mid-game.

The fan tables on the two sheets are identical — only the payment half differs.

Switch systems in **Scoring → What it pays**. The Scorekeeper follows the same
setting, and asks for the dealer's seat when Classical needs it.

Taiwanese scoring has no equivalent primary source yet, and is still assembled
from online references. Treat it as the weaker half.

⚠️ **Still worth verifying against your own table.** Mahjong has no governing
body, and values genuinely differ between regions, clubs and households.

No rule in this project was written from memory. Every scoring pattern, payout
rule and procedure carries:

- the **sources** it was drawn from, shown in the app itself,
- a **confidence marker** — `established`, `varies`, or `unverified`,
- and a **note** wherever sources conflict, stating *both* readings rather than
  silently picking one.

Conflicts between the supplied sheet and the online references, all flagged in
the data:

| Hand | Rule sheet | Online charts |
| --- | --- | --- |
| Full Flush | 7 faan | 6 faan |
| All Honours | 10 faan | 13 (limit) |
| Small Four Winds | 6 faan | 8, or limit |
| Small Three Dragons | 5 faan | 2 on top of the dragon triplets |
| Win by Kong Replacement | 2 faan, replacing Self-Pick | 1 faan on top of it |
| All Concealed Triplets | 8 faan | limit hand |

A third payment convention — the discarder alone paying face value — appears in
some online guides but is on neither sheet, so it isn't implemented.

Several hands appear on the sheet alone (Double Kong Replacement, the flower
bonuses, Blessing of Man) and are marked as such.

A test enforces that anything not marked `established` explains itself, that
`replaces` only ever points at a real pattern, and that the faan-to-points chart
matches the sheet value for value.

In the app, tap **Why?** next to any rule to see its sources.

---

## What's in V1

Turn Flow · Tile Reference · Melds & Actions · Scoring Reference · Scorekeeper,
with ruleset and terminology toggles throughout.

Scorekeeper state is held in memory only — refreshing the page clears it. That
is a deliberate V1 tradeoff.

Designed for but not built: persistence, accounts and cross-device sync,
camera tile recognition, strategy hints, and configurable house rules.
