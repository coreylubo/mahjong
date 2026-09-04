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
 * The rule sheet supplied by the project owner. Not a URL — the UI renders
 * non-link sources as plain text.
 */
export const HK_RULE_SHEET = 'Hong Kong Mahjong Rule Sheet v1.0 (3 April 2025) by /u/danma — PDF supplied by the project owner'

// ---------------------------------------------------------------------------
// Hong Kong
// ---------------------------------------------------------------------------

/**
 * Payment convention on a win off a discard. All three are in real use.
 *
 * 'newStyle'   — 出銃包三家, "the discarder pays all". The discarder alone
 *                pays, at DOUBLE the points. This is the convention printed on
 *                the rule sheet the project owner supplied, and is the default.
 * 'discarderOnly' — the discarder alone pays, at face value.
 * 'classical'  — the discarder pays double AND the other two each pay face
 *                value.
 *
 * Self-draw is the same under all three: every opponent pays face value.
 */
export type DiscardPayment = 'newStyle' | 'discarderOnly' | 'classical'

export interface HongKongTableRules {
  /** Faan needed to declare a win. */
  minimumFaan: number
  /** Faan at which the payout stops climbing. */
  limitFaan: number
  discardPayment: DiscardPayment
}

export const DEFAULT_HK_RULES: HongKongTableRules = {
  minimumFaan: 3,
  limitFaan: 13,
  discardPayment: 'newStyle',
}

/**
 * The published faan → points chart ("New Style").
 *
 * Transcribed directly from the Payment Table on the Hong Kong Mahjong Rule
 * Sheet v1.0 supplied by the project owner. Note that it is NOT a plain
 * doubling ladder: it doubles to 4 faan, then advances in two interleaved
 * doubling series (16→32→64→128→256 and 24→48→96→192→384), which is the usual
 * Hong Kong tapering. Index = faan; 13 and above all pay 384.
 */
export const HK_POINTS_TABLE: readonly number[] = [
  1, // 0 faan — a "chicken hand", only playable where the table has no minimum
  2, // 1
  4, // 2
  8, // 3
  16, // 4
  24, // 5
  32, // 6
  48, // 7
  64, // 8
  96, // 9
  128, // 10
  192, // 11
  256, // 12
  384, // 13+
]

/** Look up the base points a hand is worth, capping at the table's limit. */
export function faanToPoints(faan: number, rules: HongKongTableRules = DEFAULT_HK_RULES): number {
  const capped = Math.min(Math.max(faan, 0), rules.limitFaan, HK_POINTS_TABLE.length - 1)
  return HK_POINTS_TABLE[capped]!
}

export const FAAN_CONVERSION_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    HK_RULE_SHEET,
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
    'https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules',
  ],
  note:
    'Transcribed from the "New Style" Payment Table on the supplied rule sheet. Other charts are in circulation — some flatten differently above 6 faan, and tables that cap below 13 faan simply stop the chart early. Check your table\'s own chart.',
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
  rules?: HongKongTableRules
}

export function hongKongPayout(win: HongKongWin): PayoutBreakdown {
  const rules = win.rules ?? DEFAULT_HK_RULES
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

  if (rules.discardPayment === 'discarderOnly') {
    perSeat[win.discarderSeat] = points
    return {
      winnerReceives: points,
      perSeat,
      explanation: `Win off a discard at ${win.faan} faan. Only the discarder pays, ${points}.`,
    }
  }

  if (rules.discardPayment === 'newStyle') {
    perSeat[win.discarderSeat] = points * 2
    return {
      winnerReceives: points * 2,
      perSeat,
      explanation: `Win off a discard at ${win.faan} faan (${points} points). The discarder alone pays double, ${points * 2}.`,
    }
  }

  // Classical: discarder pays double, the other two pay face value.
  for (let seat = 0; seat < 4; seat += 1) {
    if (seat === win.winnerSeat) continue
    perSeat[seat] = seat === win.discarderSeat ? points * 2 : points
  }
  return {
    winnerReceives: points * 4,
    perSeat,
    explanation: `Win off a discard at ${win.faan} faan (classical payout). The discarder pays ${points * 2}, the other two pay ${points} each.`,
  }
}

export const HK_PAYMENT_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    HK_RULE_SHEET,
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
    'https://partypotapp.com/blog/mahjong-scoring-beginners-guide/',
  ],
  note:
    'The supplied rule sheet uses "New Style" (出銃包三家): on a discard the discarder alone pays, at double the points. Two other conventions are also in use — the discarder alone paying face value, and the classical version where the discarder pays double and the other two pay face value as well. Self-draw is the same everywhere: all three opponents pay face value.',
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
  return rules.base + rules.perTai * tai
}

export interface TaiwaneseWin {
  tai: number
  winnerSeat: number
  discarderSeat?: number
  rules?: TaiwaneseTableRules
}

export function taiwanesePayout(win: TaiwaneseWin): PayoutBreakdown {
  const rules = win.rules ?? DEFAULT_TW_RULES
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
