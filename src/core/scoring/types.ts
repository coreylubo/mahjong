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
   * Id of the pattern this one supersedes.
   *
   * The supplied Hong Kong rule sheet lists some hands indented under others,
   * with the rule "indented features replace the parent feature" — a Full Flush
   * replaces a Mixed Flush rather than adding to it. Scoring is otherwise a
   * straight sum, so without this the app would double-count.
   */
  replaces?: string
  sourcing: Sourced
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
