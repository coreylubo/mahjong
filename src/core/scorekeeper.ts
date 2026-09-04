/**
 * Scorekeeper (spec §4.6). Local state only for V1 — losing it on refresh is
 * acceptable, and nothing here touches storage.
 *
 * Written as a pure reducer over an immutable state object. That matters for
 * two reasons beyond tidiness:
 *  1. It carries to React Native without modification (spec §7.1).
 *  2. When the persistence and sync phases arrive (spec §6), a reducer with a
 *     serialisable state shape and a replayable hand log is exactly what a
 *     sync layer needs to slot underneath. No restructuring required.
 */

import type { Ruleset } from './types'
import { hongKongPayout, taiwanesePayout, type PayoutBreakdown } from './scoring/payout'
import type { HongKongTableRules, TaiwaneseTableRules } from './scoring/payout'

export interface Player {
  seat: number
  name: string
}

export interface HandRecord {
  id: string
  ruleset: Ruleset
  /** Seat that won, or null for a washout. */
  winnerSeat: number | null
  /** Seat that discarded the winning tile. undefined = self-draw or washout. */
  discarderSeat?: number
  /** Faan or tai, depending on ruleset. */
  score: number
  /** Net change per seat for this hand. Seats sum to zero. */
  deltas: Record<number, number>
  explanation: string
}

export interface ScorekeeperState {
  players: readonly Player[]
  hands: readonly HandRecord[]
}

export const DEFAULT_PLAYER_NAMES = ['East', 'South', 'West', 'North'] as const

export function createScorekeeper(names: readonly string[] = DEFAULT_PLAYER_NAMES): ScorekeeperState {
  return {
    players: [0, 1, 2, 3].map((seat) => ({ seat, name: names[seat] ?? DEFAULT_PLAYER_NAMES[seat]! })),
    hands: [],
  }
}

export interface RecordWinInput {
  ruleset: Ruleset
  winnerSeat: number
  /** Omit for a self-draw. */
  discarderSeat?: number
  /** Seat holding the deal. Used by the Hong Kong Classical payment system. */
  dealerSeat?: number
  score: number
  hkRules?: HongKongTableRules
  twRules?: TaiwaneseTableRules
}

export type ScorekeeperAction =
  | { type: 'renamePlayer'; seat: number; name: string }
  | { type: 'recordWin'; input: RecordWinInput; id: string }
  | { type: 'recordDraw'; id: string; ruleset: Ruleset }
  | { type: 'undo' }
  | { type: 'reset' }

/** Turn a payout breakdown into per-seat net deltas that sum to zero. */
function toDeltas(winnerSeat: number, payout: PayoutBreakdown): Record<number, number> {
  const deltas: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const seat of [0, 1, 2, 3]) {
    deltas[seat] = -(payout.perSeat[seat] ?? 0)
  }
  deltas[winnerSeat] = payout.winnerReceives
  return deltas
}

export function scorekeeperReducer(
  state: ScorekeeperState,
  action: ScorekeeperAction,
): ScorekeeperState {
  switch (action.type) {
    case 'renamePlayer':
      return {
        ...state,
        players: state.players.map((player) =>
          player.seat === action.seat ? { ...player, name: action.name } : player,
        ),
      }

    case 'recordWin': {
      const { input } = action
      const payout =
        input.ruleset === 'hongKong'
          ? hongKongPayout({
              faan: input.score,
              winnerSeat: input.winnerSeat,
              discarderSeat: input.discarderSeat,
              dealerSeat: input.dealerSeat,
              rules: input.hkRules,
            })
          : taiwanesePayout({
              tai: input.score,
              winnerSeat: input.winnerSeat,
              discarderSeat: input.discarderSeat,
              rules: input.twRules,
            })

      const hand: HandRecord = {
        id: action.id,
        ruleset: input.ruleset,
        winnerSeat: input.winnerSeat,
        discarderSeat: input.discarderSeat,
        score: input.score,
        deltas: toDeltas(input.winnerSeat, payout),
        explanation: payout.explanation,
      }
      return { ...state, hands: [...state.hands, hand] }
    }

    case 'recordDraw':
      return {
        ...state,
        hands: [
          ...state.hands,
          {
            id: action.id,
            ruleset: action.ruleset,
            winnerSeat: null,
            score: 0,
            deltas: { 0: 0, 1: 0, 2: 0, 3: 0 },
            explanation: 'Washout — the wall ran out. Nobody pays.',
          },
        ],
      }

    case 'undo':
      return { ...state, hands: state.hands.slice(0, -1) }

    case 'reset':
      return { ...state, hands: [] }
  }
}

/** Running total per seat, derived from the hand log rather than stored. */
export function totals(state: ScorekeeperState): Record<number, number> {
  const result: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const hand of state.hands) {
    for (const seat of [0, 1, 2, 3]) {
      result[seat] = (result[seat] ?? 0) + (hand.deltas[seat] ?? 0)
    }
  }
  return result
}

/** Seats ordered by score, highest first. Ties keep seat order. */
export function standings(state: ScorekeeperState): { player: Player; total: number }[] {
  const scores = totals(state)
  return [...state.players]
    .map((player) => ({ player, total: scores[player.seat] ?? 0 }))
    .sort((a, b) => b.total - a.total || a.player.seat - b.player.seat)
}
