export * from './types'
export * from './hongKong'
export * from './taiwanese'
export * from './payout'

import type { Ruleset } from '../types'
import { HONG_KONG_SCORING } from './hongKong'
import { TAIWANESE_SCORING } from './taiwanese'
import type { RulesetScoring } from './types'

export const SCORING_BY_RULESET: Record<Ruleset, RulesetScoring> = {
  hongKong: HONG_KONG_SCORING,
  taiwanese: TAIWANESE_SCORING,
}
