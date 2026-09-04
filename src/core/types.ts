/**
 * Shared primitives for the game data layer.
 *
 * PORTABILITY CONTRACT (spec §7.1): nothing in `src/core` may import React,
 * Mantine, or any other rendering concern. Everything here is plain data and
 * pure functions so it can be lifted into a React Native app unchanged.
 * `src/core/core.test.ts` enforces this automatically.
 */

/** Which ruleset the user has selected. */
export type Ruleset = 'hongKong' | 'taiwanese'

/**
 * How much we trust a piece of rule content (spec §8).
 *
 * Mahjong has no single governing body. Values genuinely differ between
 * regions, clubs and households, so every rule carries its provenance rather
 * than silently presenting one variant as fact.
 */
export type Confidence =
  /** Consistent across every source consulted. Safe to present plainly. */
  | 'established'
  /** Genuinely regional or house-rule dependent. We state a common default and say so. */
  | 'varies'
  /** Could not corroborate across sources. Surfaced with a warning; verify before use. */
  | 'unverified'

/** Provenance attached to any rule, value or name we display. */
export interface Sourced {
  confidence: Confidence
  /** URLs consulted when this entry was written. */
  sources: string[]
  /** Conflict or regional caveat. Rendered inline next to the rule, never hidden in an appendix. */
  note?: string
}

/** Anything with a stable id we can key React lists and lookups from. */
export interface Identified {
  id: string
}
