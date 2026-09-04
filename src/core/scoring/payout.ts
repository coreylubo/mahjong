/**
 * Payout calculation — who pays whom, and how much (spec §4.4).
 *
 * ⚠️ SPEC §8 FLAGS THIS AS A HIGHEST-RISK AREA, and rightly: payout is the part
 * of mahjong where tables differ most and where getting it wrong costs real
 * money. Every function here takes its convention as an explicit parameter
 * rather than baking one in, and the defaults are documented and cited.
 *
 * Sources consulted:
 * - https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring
 * - https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules
 * - https://4windsmj.com/kb/rules/taiwanese/rules05.htm
 * - https://partypotapp.com/blog/mahjong-scoring-beginners-guide/
 */

import type { Sourced } from '../types'

/**
 * The rule sheets supplied by the project owner. Not URLs — the UI renders
 * non-link sources as plain text.
 *
 * The two sheets carry an IDENTICAL faan table; they differ only in the
 * payment table and the payment rules that go with it. So `HK_RULE_SHEET`
 * cites the shared hand scoring, and the two style-specific constants cite the
 * payment halves.
 */
export const HK_RULE_SHEET =
  'Hong Kong Mahjong Rule Sheet v1.0 (3 April 2025) by /u/danma — PDF supplied by the project owner'
export const HK_RULE_SHEET_NEW_STYLE = `${HK_RULE_SHEET} (New Style payment table)`
export const HK_RULE_SHEET_CLASSICAL = `${HK_RULE_SHEET} (Classical payment table)`

// ---------------------------------------------------------------------------
// Hong Kong
// ---------------------------------------------------------------------------

/**
 * Hong Kong tables use one of two payment systems, and the choice decides BOTH
 * the faan → points chart AND who pays what. They are a matched pair, not two
 * independent settings — which is why this is one enum rather than two.
 *
 * 'newStyle'  — 出銃包三家, "the discarder pays all". Steeper chart, and on a
 *               discard the discarder alone pays, at double the points.
 * 'classical' — the traditional system. Flatter, banded chart, everyone pays
 *               every hand, and the payments double for various reasons which
 *               stack multiplicatively (see `classicalMultiplier`).
 *
 * Both are transcribed from the rule sheets supplied by the project owner.
 */
export type PaymentStyle = 'newStyle' | 'classical'

export interface HongKongTableRules {
  /** Faan needed to declare a win. */
  minimumFaan: number
  /** Faan at which the payout stops climbing. */
  limitFaan: number
  paymentStyle: PaymentStyle
}

export const DEFAULT_HK_RULES: HongKongTableRules = {
  minimumFaan: 3,
  limitFaan: 13,
  paymentStyle: 'newStyle',
}

/**
 * New Style faan → points. Index = faan; 13 and above all pay 384.
 *
 * Not a plain doubling ladder: it doubles to 4 faan, then runs two interleaved
 * doubling series (16→32→64→128→256 and 24→48→96→192→384).
 */
export const HK_POINTS_TABLE_NEW_STYLE: readonly number[] = [
  1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384,
]

/**
 * Classical faan → points. Index = faan; 13 and above all pay 128.
 *
 * The sheet prints this in bands — 0, 1, 2, 3, then 4-6, 7-9, 10-12, 13+ — so
 * consecutive faan often pay the same. Expanded per-faan here so lookups stay
 * a plain index.
 */
export const HK_POINTS_TABLE_CLASSICAL: readonly number[] = [
  1, 2, 4, 8, 16, 16, 16, 32, 32, 32, 64, 64, 64, 128,
]

export function hkPointsTable(style: PaymentStyle): readonly number[] {
  return style === 'classical' ? HK_POINTS_TABLE_CLASSICAL : HK_POINTS_TABLE_NEW_STYLE
}

/**
 * Look up the base points a hand is worth, capping at the table's limit.
 *
 * Faan are always whole numbers, but the value arrives from a UI input, so a
 * fractional or non-finite value is floored rather than used as an array index
 * — indexing with 3.5 would return undefined and turn every downstream total
 * into NaN.
 */
export function faanToPoints(faan: number, rules: HongKongTableRules = DEFAULT_HK_RULES): number {
  const table = hkPointsTable(rules.paymentStyle)
  const whole = Number.isFinite(faan) ? Math.floor(faan) : 0
  const capped = Math.min(Math.max(whole, 0), Math.floor(rules.limitFaan), table.length - 1)
  return table[capped]!
}

/**
 * A player cannot deal into their own hand. If a caller passes a discarder
 * equal to the winner — reachable from the UI by changing the winner after
 * picking a discarder — the only coherent reading is a self-draw. Normalising
 * here keeps the per-seat amounts summing to what the winner collects, which
 * the scorekeeper relies on to stay balanced.
 */
function normaliseDiscarder(winnerSeat: number, discarderSeat?: number): number | undefined {
  return discarderSeat === winnerSeat ? undefined : discarderSeat
}

export const FAAN_CONVERSION_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    HK_RULE_SHEET_NEW_STYLE,
    HK_RULE_SHEET_CLASSICAL,
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
  ],
  note:
    'Both charts are transcribed from the supplied rule sheets. New Style climbs steeply and prices every faan separately; Classical is flatter and bands faan together (4-6 all pay 16, 7-9 all pay 32, and so on). Which one your table uses changes the payout dramatically — a 5 faan hand is 24 points under New Style and 16 under Classical, and the two systems distribute the cost completely differently.',
}

export interface PayoutBreakdown {
  /** Total the winner collects. */
  winnerReceives: number
  /** What each seat pays, keyed by seat index 0–3. Winner's own entry is 0. */
  perSeat: Record<number, number>
  /** Plain-English summary for the table. */
  explanation: string
}

export interface HongKongWin {
  faan: number
  winnerSeat: number
  /** Seat that discarded the winning tile, or undefined for a self-draw. */
  discarderSeat?: number
  /**
   * Seat holding the deal. Only used by the Classical system, which doubles
   * payments involving the dealer. Ignored under New Style.
   */
  dealerSeat?: number
  rules?: HongKongTableRules
}

/**
 * How many times a single payer's Classical payment doubles.
 *
 * From the sheet: "When winning by discard, the discarding player's payment
 * doubles. When winning by self pick, all players' payments double. If East
 * player wins, all players' payments double. If East player loses, East
 * player's payment doubles. (All payment doubling stacks if multiple cases
 * apply)."
 *
 * Returned as a count of doublings so the stacking is visible rather than
 * buried in arithmetic.
 */
export function classicalDoublings(
  payerSeat: number,
  win: Pick<HongKongWin, 'winnerSeat' | 'discarderSeat' | 'dealerSeat'>,
): number {
  let doublings = 0
  if (win.discarderSeat === undefined) {
    doublings += 1 // Self-pick: every payment doubles.
  } else if (payerSeat === win.discarderSeat) {
    doublings += 1 // Only the player who fed the winning tile.
  }
  if (win.dealerSeat !== undefined) {
    if (win.dealerSeat === win.winnerSeat) {
      doublings += 1 // Dealer won: everyone's payment doubles.
    } else if (payerSeat === win.dealerSeat) {
      doublings += 1 // Dealer lost: only the dealer's own payment doubles.
    }
  }
  return doublings
}

function classicalPayout(input: HongKongWin, rules: HongKongTableRules): PayoutBreakdown {
  const win = { ...input, discarderSeat: normaliseDiscarder(input.winnerSeat, input.discarderSeat) }
  const points = faanToPoints(win.faan, rules)
  const perSeat: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  for (let seat = 0; seat < 4; seat += 1) {
    if (seat === win.winnerSeat) continue
    perSeat[seat] = points * 2 ** classicalDoublings(seat, win)
  }

  const total = Object.values(perSeat).reduce((sum, amount) => sum + amount, 0)
  const how = win.discarderSeat === undefined ? 'Self-draw' : 'Win off a discard'
  const dealerNote =
    win.dealerSeat === undefined
      ? ' Dealer doubling not applied — no dealer seat was set.'
      : ''

  return {
    winnerReceives: total,
    perSeat,
    explanation: `${how} at ${win.faan} faan, Classical (${points} points base). Everyone pays; doublings stack.${dealerNote}`,
  }
}

export function hongKongPayout(input: HongKongWin): PayoutBreakdown {
  const rules = input.rules ?? DEFAULT_HK_RULES
  if (rules.paymentStyle === 'classical') return classicalPayout(input, rules)

  const win = { ...input, discarderSeat: normaliseDiscarder(input.winnerSeat, input.discarderSeat) }
  const points = faanToPoints(win.faan, rules)
  const perSeat: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  if (win.discarderSeat === undefined) {
    // Self-draw: every opponent pays face value.
    for (let seat = 0; seat < 4; seat += 1) {
      if (seat !== win.winnerSeat) perSeat[seat] = points
    }
    return {
      winnerReceives: points * 3,
      perSeat,
      explanation: `Self-draw at ${win.faan} faan (${points} points). All three opponents pay ${points} each.`,
    }
  }

  // New Style on a discard: the discarder alone pays, at double.
  perSeat[win.discarderSeat] = points * 2
  return {
    winnerReceives: points * 2,
    perSeat,
    explanation: `Win off a discard at ${win.faan} faan (${points} points). The discarder alone pays double, ${points * 2}.`,
  }
}

export const HK_PAYMENT_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    HK_RULE_SHEET_NEW_STYLE,
    HK_RULE_SHEET_CLASSICAL,
    'https://partypotapp.com/blog/mahjong-scoring-beginners-guide/',
  ],
  note:
    'New Style (出銃包三家): only the discarder pays, at double the points; on a self-draw all three pay face value. Classical: everyone pays every hand, and the payments double when they fed the winning tile, when the win was a self-draw, when the dealer wins, and for the dealer when the dealer loses — all stacking. A third convention, where the discarder alone pays face value, appears in some online guides but is on neither supplied sheet.',
}

// ---------------------------------------------------------------------------
// Taiwanese
// ---------------------------------------------------------------------------

export interface TaiwaneseTableRules {
  /** The flat amount every win is worth before tai are counted (底, "dai"). */
  base: number
  /** What each tai is worth on top of the base. */
  perTai: number
  /** Minimum tai needed to declare a win. Often zero. */
  minimumTai: number
}

export const DEFAULT_TW_RULES: TaiwaneseTableRules = {
  base: 3,
  perTai: 2,
  minimumTai: 0,
}

/**
 * Taiwanese payout: base + (factor × tai), per paying player.
 *
 * The worked example in the sources: with a base of 3 and a factor of 2, a
 * 5-tai hand costs each payer 3 + 2×5 = 13.
 */
export function taiToAmount(tai: number, rules: TaiwaneseTableRules = DEFAULT_TW_RULES): number {
  // Tai are whole numbers; guard against a fractional or non-finite UI value.
  const whole = Number.isFinite(tai) ? Math.max(Math.floor(tai), 0) : 0
  return rules.base + rules.perTai * whole
}

export interface TaiwaneseWin {
  tai: number
  winnerSeat: number
  discarderSeat?: number
  rules?: TaiwaneseTableRules
}

export function taiwanesePayout(input: TaiwaneseWin): PayoutBreakdown {
  const rules = input.rules ?? DEFAULT_TW_RULES
  const win = { ...input, discarderSeat: normaliseDiscarder(input.winnerSeat, input.discarderSeat) }
  const amount = taiToAmount(win.tai, rules)
  const perSeat: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  if (win.discarderSeat === undefined) {
    for (let seat = 0; seat < 4; seat += 1) {
      if (seat !== win.winnerSeat) perSeat[seat] = amount
    }
    return {
      winnerReceives: amount * 3,
      perSeat,
      explanation: `Self-draw at ${win.tai} tai. All three opponents pay ${amount} each (${rules.base} base + ${rules.perTai} × ${win.tai}).`,
    }
  }

  perSeat[win.discarderSeat] = amount
  return {
    winnerReceives: amount,
    perSeat,
    explanation: `Win off a discard at ${win.tai} tai. The discarder alone pays ${amount} (${rules.base} base + ${rules.perTai} × ${win.tai}).`,
  }
}

export const TW_PAYMENT_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://4windsmj.com/kb/rules/taiwanese/rules05.htm',
    'http://mahjong.wikidot.com/rules:taiwanese-scoring',
  ],
  note:
    'The base and per-tai factor are agreed by the table before play, not fixed by the ruleset. Discard: the discarder alone pays. Self-draw: all three pay. Dealer bonuses and dealer-repeat tai are counted into the tai total before this conversion.',
}

/** Side-by-side payout differences, for the inline ruleset comparison (spec §3). */
export interface PayoutDifference {
  topic: string
  hongKong: string
  taiwanese: string
  sourcing: Sourced
}

export const PAYOUT_DIFFERENCES: readonly PayoutDifference[] = [
  {
    topic: 'Scoring unit',
    hongKong: 'Faan (番). Points climb steeply with each faan, following a printed chart rather than a formula.',
    taiwanese: 'Tai (台). Tai add up, then multiply a fixed stake — the scale is linear.',
    sourcing: {
      confidence: 'established',
      sources: ['https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring', 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'],
    },
  },
  {
    topic: 'Win off a discard',
    hongKong: 'The discarder alone pays, at double the points. The other two pay nothing.',
    taiwanese: 'The discarder alone pays the full amount. The other two pay nothing.',
    sourcing: {
      confidence: 'varies',
      sources: [HK_RULE_SHEET, 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'],
      note: 'The Hong Kong figure follows the supplied rule sheet\'s "New Style" (出銃包三家). Other Hong Kong tables have the discarder pay face value, or use the classical version where the other two pay as well.',
    },
  },
  {
    topic: 'Self-draw',
    hongKong: 'All three opponents pay in full, and the win itself is worth an extra faan.',
    taiwanese: 'All three opponents pay in full, and the win itself is worth an extra tai.',
    sourcing: {
      confidence: 'established',
      sources: ['https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring', 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'],
    },
  },
  {
    topic: 'Dealer',
    hongKong: 'No scoring bonus for being dealer. The dealer simply keeps the deal after winning.',
    taiwanese: 'The dealer scores an extra tai, and each consecutive hand they hold the deal adds more.',
    sourcing: {
      confidence: 'varies',
      sources: ['https://4windsmj.com/kb/rules/taiwanese/rules05.htm', 'https://mahjmahj.co/styles/taiwanese-mahjong'],
      note: 'The size of the dealer-repeat bonus varies; 2 tai per repeat is common.',
    },
  },
  {
    topic: 'Minimum to win',
    hongKong: 'Commonly 3 faan. You cannot declare a win below it.',
    taiwanese: 'Often none at all — a bare base score is a legal win.',
    sourcing: {
      confidence: 'varies',
      sources: ['https://mahjongcompare.com/styles/hong-kong', 'http://mahjong.wikidot.com/rules:taiwanese-scoring'],
      note: 'Both are table agreements rather than fixed rules.',
    },
  },
]
