/**
 * Setting up: seats, dealer, wall, dice, deal (spec §4.1).
 *
 * ⚠️ SPEC §8 APPLIES HERE. Nothing in this file is written from recall.
 *
 * This is deliberately separate from `turnFlow.ts`. Setting up is a different
 * activity from taking a turn — it happens before anyone has a hand, it is
 * mostly physical (stacking, rolling, counting stacks), and the parts that vary
 * between Hong Kong and Taiwanese play are different parts. Mixing the two into
 * one screen made the turn loop harder to find mid-hand.
 *
 * The other distinction this file makes is between what happens ONCE per game
 * (settling who sits where and who deals first) and what happens at the START
 * OF EVERY HAND (rebuilding the wall, rolling, dealing). Beginners routinely
 * conflate the two and re-draw for seats every hand.
 *
 * Sources consulted:
 * - https://4windsmj.com/kb/rules/taiwanese/rules02.htm (Taiwanese preliminaries)
 * - https://4windsmj.com/kb/rules/taiwanese/rules01.htm (tile counts)
 * - https://en.wikipedia.org/wiki/Mahjong
 * - https://mahjongbritishrules.wordpress.com/the-game/preparing-to-play/
 * - https://www.coololdgames.com/tile-games/mahjong/hong-kong/
 */

import type { Ruleset, Sourced } from './types'

const FOURWINDS_PRELIM = 'https://4windsmj.com/kb/rules/taiwanese/rules02.htm'
const FOURWINDS_TILES = 'https://4windsmj.com/kb/rules/taiwanese/rules01.htm'
const WIKIPEDIA = 'https://en.wikipedia.org/wiki/Mahjong'
const BMJA = 'https://mahjongbritishrules.wordpress.com/the-game/preparing-to-play/'
const COOLOLDGAMES = 'https://www.coololdgames.com/tile-games/mahjong/hong-kong/'

/**
 * The numbers that actually differ between the two rulesets.
 *
 * Everything about building the wall is shared — a full set is 144 tiles
 * either way, so every table builds four walls of 18 stacks. What differs is
 * how many tiles come off it: Hong Kong deals a 13-tile hand (four sets and a
 * pair), Taiwanese a 16-tile hand (five sets and a pair).
 */
export interface DealShape {
  /** Tiles in a non-dealer's starting hand. */
  handSize: number
  /** The dealer starts one tile ahead, and discards to bring themselves level. */
  dealerHandSize: number
  /** Stacks of two each player builds. */
  stacksPerWall: number
  /** How many rounds of four tiles are dealt. */
  roundsOfFour: number
  /**
   * Whether a final single tile goes round after the rounds of four.
   *
   * This is a real structural difference, not a rounding detail. Hong Kong
   * deals 3 x 4 and then one single each, reaching 13. Taiwanese deals 4 x 4
   * and stops, reaching 16 — there is no single round.
   */
  takesFinalSingle: boolean
  /** Stacks set aside as replacements for kongs and flowers. */
  deadWallStacks: number
  /**
   * How many sets the finished hand needs, alongside its one pair.
   *
   * A count rather than a phrase because the app lets the player choose whether
   * these are called "melds" or "sets" — the word is a UI concern, the number
   * is not.
   */
  setCount: number
}

export const DEAL_SHAPE: Record<Ruleset, DealShape> = {
  hongKong: {
    handSize: 13,
    dealerHandSize: 14,
    stacksPerWall: 18,
    roundsOfFour: 3,
    takesFinalSingle: true,
    deadWallStacks: 7,
    setCount: 4,
  },
  taiwanese: {
    handSize: 16,
    dealerHandSize: 17,
    stacksPerWall: 18,
    roundsOfFour: 4,
    takesFinalSingle: false,
    deadWallStacks: 8,
    setCount: 5,
  },
}

export const DEAL_SHAPE_SOURCING: Sourced = {
  confidence: 'established',
  sources: [WIKIPEDIA, BMJA, FOURWINDS_PRELIM, FOURWINDS_TILES],
  note:
    'A full set is 144 tiles — 136 playing tiles plus 8 flowers and seasons — so each player builds 18 stacks of two whichever ruleset you play. The dead wall size is the part that varies: 7 stacks (14 tiles) is the common Hong Kong figure, 8 stacks (16 tiles) the Taiwanese one.',
}

export interface SetupStep {
  id: string
  title: string
  detail: string
  /**
   * Replaces `detail` for a ruleset whose procedure genuinely differs. Absent
   * means the step is the same either way — which is most of them.
   */
  perRuleset?: Partial<Record<Ruleset, string>>
  beginnerNote?: string
  sourcing: Sourced
}

/**
 * Done ONCE, before the first hand. Seats and the first dealer are settled
 * here and then left alone — the deal passes around the table under the rules
 * in `turnFlow.ts`, and nobody re-draws for seats mid-game.
 */
export const SEATING_SEQUENCE: readonly SetupStep[] = [
  {
    id: 'temp-seats',
    title: 'Sit anywhere, then roll for a temporary East',
    detail:
      'Take any seat. One player rolls two dice and counts counter-clockwise around the table, starting with themselves as 1. That player becomes the temporary East, and the other three become temporary South, West and North going counter-clockwise.',
    beginnerNote:
      'Counter-clockwise around the table is the direction that passes play to the person on your RIGHT. It is not compass direction — the East seat is wherever the dice land.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM, WIKIPEDIA, BMJA],
      note:
        'Methods differ. This is the full dice-and-wind-tile procedure. Many tables shortcut it: everyone rolls once and the highest becomes East, or the four wind tiles are simply drawn from a shuffled stack. Any of them is fair — pick one and move on.',
    },
  },
  {
    id: 'draw-winds',
    title: 'Draw for real seats with the four wind tiles',
    detail:
      'Shuffle one East, South, West and North face down and stack them. Temporary East rolls two dice and counts counter-clockwise from themselves; the player indicated takes the top tile, and the rest take the next tiles going counter-clockwise. Everyone then moves to the seat their wind names.',
    beginnerNote:
      'The winds sit counter-clockwise in the order East, South, West, North. They deliberately do not follow the compass.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM, BMJA],
      note:
        'A common shortcut: whoever draws East stays put and the others arrange themselves around them, skipping the second dice roll.',
    },
  },
  {
    id: 'first-dealer',
    title: 'Roll once more for the first dealer',
    detail:
      'The player now sitting East rolls two dice and counts counter-clockwise from themselves. The player indicated is East for the first hand, and the other seats take their winds counter-clockwise from there.',
    beginnerNote:
      'From here the deal moves under the normal rules — see Turn Flow. Players keep these physical seats for the whole game even as the wind labels rotate.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM],
      note:
        'Plenty of tables skip this third roll entirely and let whoever drew the East tile deal first. It changes nothing about fairness.',
    },
  },
]

/**
 * Done at the START OF EVERY HAND, including the first. The wall is rebuilt
 * from scratch each time.
 */
export const WALL_SEQUENCE: readonly SetupStep[] = [
  {
    id: 'shuffle',
    title: 'Turn everything face down and wash the tiles',
    detail:
      'All 144 tiles go face down on the table and get mixed thoroughly. Traditionally the players who are not dealing do the mixing, and the dealer calls the start.',
    sourcing: {
      confidence: 'established',
      sources: [FOURWINDS_PRELIM, FOURWINDS_TILES, WIKIPEDIA],
      note:
        'A full set is 144 tiles: 108 suited, 28 honours, and 8 flowers and seasons. Some tables play without the flowers, which drops it to 136.',
    },
  },
  {
    id: 'build',
    title: 'Each player builds 18 stacks, two tiles high',
    detail:
      'Take 36 tiles and build a row 18 long and 2 high in front of you, then push all four rows together into a hollow square. That square is the wall.',
    beginnerNote:
      '18 stacks each × 4 players × 2 tiles = 144. If someone is short, a tile is still face down on the table.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIPEDIA, BMJA, FOURWINDS_PRELIM],
      note:
        'The Four Winds collection notes a Taiwanese variation for tables using only the four flowers and not the seasons: East and West build 18, South and North build 17.',
    },
  },
  {
    id: 'roll',
    title: 'Dealer rolls to pick which wall gets broken',
    detail:
      'The dealer rolls two dice and counts counter-clockwise around the four walls, starting with their own as 1. So 5 and 9 land back on the dealer, 2/6/10 on the next seat, 3/7/11 on the one after, 4/8/12 on the last.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM, WIKIPEDIA, BMJA],
      note:
        'Two dice is the common convention; some tables use three, and the British association rolls a second time to fix the break point. The break point has no effect on fairness — it exists to stop anyone predicting which tiles they will get. Agree one convention and keep it.',
    },
  },
  {
    id: 'break',
    title: 'Count that many stacks in from the right end and break there',
    detail:
      'On the wall the dice chose, count the same number of stacks in from its RIGHT-HAND end. Break the wall there by easing the tiles apart. Drawing starts to the left of the break and runs away from it.',
    beginnerNote:
      'The same number does double duty: it picks the wall, then it counts the stacks. You do not roll again.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM, WIKIPEDIA],
      note:
        'Counting from the right end is the usual convention, but some tables count from the left, and some roll a second time for the stack count. It matters only that everyone agrees before the first tile is drawn.',
    },
  },
  {
    id: 'dead-wall',
    title: 'Set aside the dead wall behind the break',
    detail:
      'The stacks immediately to the RIGHT of the break are reserved as replacements for kongs, flowers and seasons. They are not part of the live wall and are never drawn from in normal play.',
    perRuleset: {
      hongKong:
        'Hong Kong tables commonly reserve 7 stacks — 14 tiles — as the kong box. Many casual tables skip marking it out and simply draw replacements from the tail end of the wall instead.',
      taiwanese:
        'Taiwanese play reserves 8 stacks — 16 tiles. The dead wall is replenished: each time a replacement is taken, a tile moves across from the tail of the live wall to keep it at 16.',
    },
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS_PRELIM, BMJA, COOLOLDGAMES],
      note:
        'Dead wall size and whether it is replenished are both table conventions. What is consistent everywhere: replacement tiles come from the far end of the wall, never from the end you are drawing from.',
    },
  },
  {
    id: 'deal',
    title: 'Deal four tiles at a time, going round',
    detail:
      'Starting to the left of the break, the dealer takes two stacks — four tiles — then each player in counter-clockwise order does the same. Keep going round.',
    perRuleset: {
      hongKong:
        'Three rounds of four gets everyone to 12, then ONE more single each makes 13. The dealer takes an extra tile on top, starting on 14, and discards to come back down to 13.',
      taiwanese:
        'Four rounds of four gets everyone straight to 16 — there is no single-tile round in Taiwanese play, unlike Hong Kong. The dealer then draws one extra, starting on 17, and discards to come back down to 16.',
    },
    sourcing: {
      confidence: 'established',
      sources: [WIKIPEDIA, BMJA, FOURWINDS_PRELIM],
    },
  },
  {
    id: 'flowers',
    title: 'Declare flowers and draw replacements',
    detail:
      'Anyone dealt a flower or season lays it face up beside their hand and draws a replacement from the back of the wall. Do this in wind order — East first, then South, West, North.',
    beginnerNote:
      'If a replacement is itself a flower, wait for the others to finish their first pass before taking another. Get this settled now; once play starts, a miscount is hard to unpick.',
    sourcing: {
      confidence: 'established',
      sources: [FOURWINDS_PRELIM, WIKIPEDIA, BMJA],
      note:
        'The Four Winds collection is explicit that a player drawing further bonus tiles waits for the other players to take their replacements before going again.',
    },
  },
  {
    id: 'begin',
    title: 'Count your tiles, then the dealer discards',
    detail:
      'Check you hold the right number before anything moves. The dealer is one tile ahead and opens the hand by discarding; play then passes counter-clockwise.',
    sourcing: {
      confidence: 'established',
      sources: [FOURWINDS_PRELIM, WIKIPEDIA, BMJA],
    },
  },
]

/**
 * What a player should be holding once the deal is done — the quickest way to
 * catch a misdeal before it becomes unfixable.
 */
export function expectedTileCount(ruleset: Ruleset, isDealer: boolean): number {
  const shape = DEAL_SHAPE[ruleset]
  return isDealer ? shape.dealerHandSize : shape.handSize
}

/** Human-readable shape of the deal, e.g. "3 x 4, then 1 each". */
export function describeDeal(ruleset: Ruleset): string {
  const shape = DEAL_SHAPE[ruleset]
  return shape.takesFinalSingle
    ? `${shape.roundsOfFour} × 4, then 1 each`
    : `${shape.roundsOfFour} × 4`
}
