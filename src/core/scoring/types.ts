/** Shared scoring shapes for both rulesets. */

import type { Ruleset, Sourced } from '../types'

export type PatternCategory =
  /** The overall shape of the whole hand. */
  | 'hand'
  /** Something a single meld earns. */
  | 'meld'
  /** Flowers and seasons. */
  | 'bonus'
  /** How or when you won, rather than what you held. */
  | 'situational'
  /** Pays the agreed maximum regardless of what else is in the hand. */
  | 'limit'

export interface ScoringPattern {
  id: string
  /** English name. Always present — this is the instructional name. */
  name: string
  /** Chinese name, shown alongside when the player has picked a Chinese terminology setting. */
  chinese?: string
  /** Romanized Cantonese (HK) or Mandarin (Taiwanese) reading. */
  romanized?: string
  /** Score in the ruleset's own unit: faan for Hong Kong, tai for Taiwanese. */
  value: number
  /** Set when the pattern pays the table limit rather than a fixed value. */
  isLimit?: boolean
  category: PatternCategory
  /** What the hand or meld actually is. Beginner-readable, no jargon. */
  description: string
  /** Extra help for someone playing their second game. */
  beginnerNote?: string
  /** True when the pattern can be counted more than once in one hand (e.g. per dragon pung). */
  repeatable?: boolean
  /**
   * Id, or ids, of the pattern(s) this one supersedes.
   *
   * The supplied Hong Kong rule sheet lists some hands indented under others,
   * with the rule "indented features replace the parent feature" — a Full Flush
   * replaces a Mixed Flush rather than adding to it. Scoring is otherwise a
   * straight sum, so without this the app would double-count.
   *
   * Some hands absorb MORE than one pattern: Concealed Self-Draw packages both
   * Concealed Hand and Self-draw into its 3 tai, and Great Three Dragons
   * absorbs all three repeatable dragon-pung bonuses. Naming only one of them
   * leaves the rest countable, which is the double-count this field exists to
   * prevent — so it takes a list as readily as a single id.
   */
  replaces?: string | readonly string[]
  sourcing: Sourced
}

/** Normalises `replaces` so callers never have to handle both shapes. */
export function replacedIds(pattern: ScoringPattern): readonly string[] {
  if (!pattern.replaces) return []
  return typeof pattern.replaces === 'string' ? [pattern.replaces] : pattern.replaces
}

export interface RulesetScoring {
  ruleset: Ruleset
  /** 'faan' or 'tai' — a terminology key. */
  unitTermKey: string
  /** Minimum score needed to declare a win, and how much that varies. */
  minimum: { common: number; range: string; sourcing: Sourced }
  /** Where the payout stops climbing. */
  limit: { common: number; range: string; sourcing: Sourced }
  patterns: readonly ScoringPattern[]
}
