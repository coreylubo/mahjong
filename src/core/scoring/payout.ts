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

// ---------------------------------------------------------------------------
// Hong Kong
// ---------------------------------------------------------------------------

export interface HongKongTableRules {
  /** Faan needed to declare a win. */
  minimumFaan: number
  /** Faan at which the payout stops climbing. */
  limitFaan: number
  /**
   * Payment convention on a win off a discard.
   *
   * 'discarderOnly' — the modern Hong Kong standard: the player who discarded
   *   pays the whole amount and the other two pay nothing.
   * 'discarderDouble' — the classical convention: the discarder pays double
   *   and the other two each pay the base amount.
   */
  discardPayment: 'discarderOnly' | 'discarderDouble'
}

export const DEFAULT_HK_RULES: HongKongTableRules = {
  minimumFaan: 3,
  limitFaan: 10,
  discardPayment: 'discarderOnly',
}

/**
 * Convert faan into payout units.
 *
 * The Hong Kong chart is a doubling ladder anchored on the table minimum: the
 * cheapest legal win is worth 1 unit and each further faan doubles it, until
 * the limit caps it. The usual published anchor corroborates this — with a
 * 3-faan minimum and a 10-faan limit, a limit hand is worth 128 units
 * (2^(10-3) = 128).
 *
 * Below the minimum the ladder still runs, so tables playing a 0- or 1-faan
 * minimum get fractional-looking values; we clamp at 1 unit rather than
 * inventing a sub-unit convention.
 */
export function faanToUnits(faan: number, rules: HongKongTableRules = DEFAULT_HK_RULES): number {
  const capped = Math.min(faan, rules.limitFaan)
  const steps = capped - rules.minimumFaan
  return steps <= 0 ? 1 : 2 ** steps
}

export const FAAN_CONVERSION_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
    'https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules',
    'https://www.mahjonggame.hk/learn/hk-mahjong/scoring',
  ],
  note:
    'Tables use their own printed conversion charts, and several tapering variants exist (some flatten the doubling above 6 faan). This app uses a clean doubling ladder anchored on the table minimum, which matches the commonly published figure of 128 units for a 10-faan limit hand at a 3-faan minimum. Check your table\'s chart.',
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
  const units = faanToUnits(win.faan, rules)
  const perSeat: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }

  if (win.discarderSeat === undefined) {
    // Self-draw: everyone pays the full amount.
    for (let seat = 0; seat < 4; seat += 1) {
      if (seat !== win.winnerSeat) perSeat[seat] = units
    }
    return {
      winnerReceives: units * 3,
      perSeat,
      explanation: `Self-draw at ${win.faan} faan. All three opponents pay ${units} each.`,
    }
  }

  if (rules.discardPayment === 'discarderOnly') {
    perSeat[win.discarderSeat] = units
    return {
      winnerReceives: units,
      perSeat,
      explanation: `Win off a discard at ${win.faan} faan. Only the discarder pays, ${units}.`,
    }
  }

  // Classical: discarder pays double, the other two pay base.
  for (let seat = 0; seat < 4; seat += 1) {
    if (seat === win.winnerSeat) continue
    perSeat[seat] = seat === win.discarderSeat ? units * 2 : units
  }
  return {
    winnerReceives: units * 4,
    perSeat,
    explanation: `Win off a discard at ${win.faan} faan (classical payout). The discarder pays ${units * 2}, the other two pay ${units} each.`,
  }
}

export const HK_PAYMENT_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
    'https://partypotapp.com/blog/mahjong-scoring-beginners-guide/',
  ],
  note:
    'Two conventions are both in use. Modern Hong Kong play: only the discarder pays. Classical play: the discarder pays double and the other two pay base. Self-draw is consistent across both — all three opponents pay in full.',
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
    hongKong: 'Faan (番). Each faan roughly doubles the payout — the scale is exponential.',
    taiwanese: 'Tai (台). Tai add up, then multiply a fixed stake — the scale is linear.',
    sourcing: {
      confidence: 'established',
      sources: ['https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring', 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'],
    },
  },
  {
    topic: 'Win off a discard',
    hongKong: 'The discarder pays the full amount; the other two pay nothing.',
    taiwanese: 'The discarder pays the full amount; the other two pay nothing.',
    sourcing: {
      confidence: 'varies',
      sources: ['https://partypotapp.com/blog/mahjong-scoring-beginners-guide/', 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'],
      note: 'Classical Hong Kong play instead has the discarder pay double while the other two pay base. Both conventions are in use.',
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
