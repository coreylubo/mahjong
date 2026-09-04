/**
 * Turn flow: seating, dealing, the wall, and the wind trackers (spec §4.1).
 *
 * Sources consulted:
 * - https://www.coololdgames.com/tile-games/mahjong/hong-kong/
 * - https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring
 * - https://mahjongbritishrules.wordpress.com/the-game/playing-the-game/
 * - https://4windsmj.com/kb/rules/taiwanese/
 */

import type { Ruleset, Sourced } from './types'
import { WIND_ORDER, type Wind } from './tiles'

/**
 * Play runs counter-clockwise: East → South → West → North → East.
 *
 * Beginners routinely get this backwards because the tiles are passed to the
 * player on the RIGHT, which feels clockwise from above.
 */
export const TURN_DIRECTION = 'counter-clockwise' as const

export function nextSeat(seat: number): number {
  return (seat + 1) % 4
}

export function seatWind(seat: number): Wind {
  return WIND_ORDER[seat % 4]!
}

export function windSeat(wind: Wind): number {
  return WIND_ORDER.indexOf(wind)
}

export interface TurnStep {
  id: string
  title: string
  detail: string
  sourcing?: Sourced
}

/** What happens on your own turn, in order. */
export const TURN_SEQUENCE: readonly TurnStep[] = [
  {
    id: 'draw',
    title: 'Draw one tile',
    detail: 'Take the next tile from the live wall, moving in the direction the deal was dealt. If it is a flower or season, set it aside face up and draw a replacement from the back of the wall.',
  },
  {
    id: 'declare',
    title: 'Declare anything you want to declare',
    detail: 'Concealed kong, added kong, or a win on the tile you just drew (self-draw).',
  },
  {
    id: 'discard',
    title: 'Discard one tile',
    detail: 'Place it face up in the middle and say its name. Your turn ends the moment it lands.',
  },
  {
    id: 'others',
    title: 'Others may claim it',
    detail: 'Any player may claim to win or to pung/kong. Only the player to your right may chow. If nobody claims, play passes to the player on your right.',
  },
]

/** What you can do while it is NOT your turn. */
export const OFF_TURN_ACTIONS: readonly TurnStep[] = [
  {
    id: 'win',
    title: 'Win on a discard',
    detail: 'Any discard, from any player, if it completes your hand and meets the minimum score.',
  },
  {
    id: 'pungkong',
    title: 'Pung or kong a discard',
    detail: 'Any discard, from any player. This jumps the turn order — play resumes from you.',
  },
  {
    id: 'chow',
    title: 'Chow a discard',
    detail: 'Only from the player immediately to your left, and only if nobody wants it for a win, pung or kong.',
  },
]

export interface WallStep {
  id: string
  title: string
  detail: string
}

/**
 * Building and breaking the wall. Dice conventions are one of the most
 * variable parts of the game — this is the common Hong Kong procedure and is
 * flagged as such in the UI.
 */
export const WALL_SEQUENCE: readonly WallStep[] = [
  {
    id: 'build',
    title: 'Build four walls',
    detail: 'Each player stacks their tiles two high in front of them, then pushes the wall forward into a square.',
  },
  {
    id: 'roll',
    title: 'Dealer rolls the dice',
    detail: 'Count that many players counter-clockwise, starting with the dealer as 1. That player\'s wall gets broken.',
  },
  {
    id: 'count',
    title: 'Count in from the right end',
    detail: 'On the chosen wall, count the same number of stacks in from the right-hand end. Break the wall there.',
  },
  {
    id: 'deal',
    title: 'Deal from the break, moving right',
    detail: 'Deal four tiles at a time to each player, three times around (12 tiles each), then one more each. The dealer takes one extra to start.',
  },
  {
    id: 'backfill',
    title: 'Replacements come from the other end',
    detail: 'Flower and kong replacement tiles are drawn from the BACK of the wall — the tail end, not the live end.',
  },
]

export const WALL_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://www.coololdgames.com/tile-games/mahjong/hong-kong/',
    'https://mahjongbritishrules.wordpress.com/the-game/playing-the-game/',
  ],
  note:
    'Dice count conventions differ: some tables roll twice, some count stacks from the left, some deal the dealer\'s 14th tile by jumping ahead. The break point does not affect fairness — pick one and be consistent.',
}

// ---------------------------------------------------------------------------
// Round and seat wind tracker
// ---------------------------------------------------------------------------

export interface RoundState {
  /** The prevailing wind for the current round. Starts at East. */
  roundWind: Wind
  /** Seat index (0–3) currently holding the deal. */
  dealerSeat: number
  /** How many hands the current dealer has held the deal in a row. 0 on a fresh deal. */
  dealerStreak: number
  /** Hands completed in this round so far. */
  handNumber: number
}

export const INITIAL_ROUND: RoundState = {
  roundWind: 'east',
  dealerSeat: 0,
  dealerStreak: 0,
  handNumber: 1,
}

/** Seat wind for a given seat, relative to who is currently dealing. */
export function seatWindForPlayer(seat: number, dealerSeat: number): Wind {
  return seatWind((seat - dealerSeat + 4) % 4)
}

export type HandOutcome =
  | { type: 'win'; winnerSeat: number }
  | { type: 'draw' }

export interface AdvanceOptions {
  /**
   * Whether the dealer keeps the deal after winning. Near-universally yes.
   */
  dealerKeepsDealOnWin?: boolean
  /**
   * Whether the dealer keeps the deal on a washout. This genuinely varies —
   * default follows the most common Hong Kong practice.
   */
  dealerKeepsDealOnDraw?: boolean
}

/**
 * Advance the round after a hand finishes.
 *
 * Pure: takes state in, returns new state. No mutation, no side effects — this
 * is exactly the kind of function that has to survive the move to native.
 */
export function advanceRound(
  state: RoundState,
  outcome: HandOutcome,
  options: AdvanceOptions = {},
): RoundState {
  const { dealerKeepsDealOnWin = true, dealerKeepsDealOnDraw = true } = options

  const dealerKeeps =
    outcome.type === 'draw'
      ? dealerKeepsDealOnDraw
      : outcome.winnerSeat === state.dealerSeat && dealerKeepsDealOnWin

  if (dealerKeeps) {
    return { ...state, dealerStreak: state.dealerStreak + 1, handNumber: state.handNumber + 1 }
  }

  const nextDealer = nextSeat(state.dealerSeat)
  // The round wind advances when the deal returns to the seat that started
  // the round — i.e. when the deal passes all the way around the table.
  const roundAdvances = nextDealer === 0
  const roundIndex = WIND_ORDER.indexOf(state.roundWind)
  return {
    roundWind: roundAdvances ? WIND_ORDER[(roundIndex + 1) % 4]! : state.roundWind,
    dealerSeat: nextDealer,
    dealerStreak: 0,
    handNumber: state.handNumber + 1,
  }
}

export const ROUND_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring',
    'https://4windsmj.com/kb/rules/taiwanese/',
  ],
  note:
    'Whether the dealer keeps the deal after a washout is a genuine house rule. Taiwanese play also tracks consecutive dealer wins as a scoring bonus, which Hong Kong play does not.',
}

/** How long a full game runs, per ruleset. */
export const GAME_LENGTH: Record<Ruleset, { label: string; detail: string }> = {
  hongKong: {
    label: 'Four rounds',
    detail: 'East, South, West and North rounds. Many casual tables play only the East round.',
  },
  taiwanese: {
    label: 'Four rounds (一將)',
    detail: 'Each round the deal passes all the way around the table. Dealer repeats extend the round.',
  },
}
