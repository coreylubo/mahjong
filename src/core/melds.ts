/**
 * Melds and claiming actions (spec §4.3).
 *
 * Sources consulted:
 * - https://www.sloperama.com/mjfaq/mjfaq20.html (commonly misunderstood rules)
 * - https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring
 * - https://www.coololdgames.com/tile-games/mahjong/hong-kong/
 * - https://4windsmj.com/kb/rules/taiwanese/
 */

import type { Ruleset, Sourced } from './types'

export type MeldType = 'chow' | 'pung' | 'kong' | 'pair'

export type KongVariant = 'exposed' | 'concealed' | 'added'

export interface MeldRule {
  id: MeldType
  /** Terminology key — the display name comes from the terminology table. */
  termKey: MeldType
  /** What the meld physically is. */
  shape: string
  /** When you are allowed to make it. */
  legality: string
  /** Who you may take the tile from. */
  claimableFrom: string
  /** What it costs you — the concealment consequence beginners miss. */
  concealmentEffect: string
  sourcing: Sourced
}

export const MELD_RULES: readonly MeldRule[] = [
  {
    id: 'chow',
    termKey: 'chow',
    shape: 'Three tiles in a row in the same suit, e.g. 4-5-6 Bamboo. Honours can never form a chow.',
    legality: 'Only on the discard from the player immediately to your left (the player who goes right before you).',
    claimableFrom: 'The player to your left, only.',
    concealmentEffect: 'Exposed. You lose any concealed-hand bonus for the rest of the hand.',
    sourcing: {
      confidence: 'established',
      sources: ['https://www.sloperama.com/mjfaq/mjfaq20.html', 'https://www.coololdgames.com/tile-games/mahjong/hong-kong/'],
    },
  },
  {
    id: 'pung',
    termKey: 'pung',
    shape: 'Three identical tiles, e.g. three Red Dragons.',
    legality: "On any player's discard, at any point in the turn order.",
    claimableFrom: 'Any player.',
    concealmentEffect: 'Exposed. Taking a pung off a discard breaks a concealed hand.',
    sourcing: {
      confidence: 'established',
      sources: ['https://www.sloperama.com/mjfaq/mjfaq20.html'],
    },
  },
  {
    id: 'kong',
    termKey: 'kong',
    shape: 'Four identical tiles. Counts as one set, not two — see the three kinds below.',
    legality: "On any player's discard, or from your own hand on your turn.",
    claimableFrom: 'Any player (exposed kong), or nobody (concealed kong).',
    concealmentEffect: 'A concealed kong keeps your hand concealed. An exposed or added kong does not.',
    sourcing: {
      confidence: 'established',
      sources: ['https://www.sloperama.com/mjfaq/mjfaq20.html', 'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring'],
    },
  },
  {
    id: 'pair',
    termKey: 'pair',
    shape: 'Two identical tiles. Every winning hand needs exactly one pair.',
    legality: 'You cannot claim a discard to make a pair — only to complete your winning hand.',
    claimableFrom: 'Nobody, except as the final tile of a win.',
    concealmentEffect: 'None. A pair sits in your hand.',
    sourcing: {
      confidence: 'established',
      sources: ['https://www.coololdgames.com/tile-games/mahjong/hong-kong/'],
    },
  },
]

export interface KongRule {
  variant: KongVariant
  label: string
  how: string
  keepsHandConcealed: boolean
  note: string
}

export const KONG_RULES: readonly KongRule[] = [
  {
    variant: 'exposed',
    label: 'Exposed kong',
    how: 'You hold three; someone discards the fourth. Claim it and lay all four face up.',
    keepsHandConcealed: false,
    note: 'Then draw a replacement tile from the back of the wall, and discard as normal.',
  },
  {
    variant: 'concealed',
    label: 'Concealed kong',
    how: 'You already hold all four. Declare it on your own turn and lay it down, usually with the two end tiles face down.',
    keepsHandConcealed: true,
    note: 'Your hand still counts as concealed. Draw a replacement tile from the back of the wall.',
  },
  {
    variant: 'added',
    label: 'Added kong',
    how: 'You already have an exposed pung and later draw the fourth tile. Add it to the meld on your turn.',
    keepsHandConcealed: false,
    note: 'Draw a replacement from the back of the wall. Some tables let another player win off the added tile — agree this before you start.',
  },
]

export const KONG_SOURCING: Sourced = {
  confidence: 'varies',
  sources: ['https://www.sloperama.com/mjfaq/mjfaq20.html', 'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring'],
  note: 'Robbing an added kong to win is a common but not universal rule. Whether a concealed kong can be robbed differs too. Confirm with your table.',
}

/**
 * Claim priority when more than one player wants the same discard (spec §8 —
 * flagged as a high-risk area, so the ordering is stated explicitly here).
 */
export interface ClaimPriorityStep {
  rank: number
  claim: string
  detail: string
}

export const CLAIM_PRIORITY: readonly ClaimPriorityStep[] = [
  {
    rank: 1,
    claim: 'Winning the hand',
    detail: 'Beats everything. If two players can both win on the same tile, the one nearest to the discarder in turn order wins.',
  },
  {
    rank: 2,
    claim: 'Pung or kong',
    detail: 'Beat a chow, no matter whose turn is next. Pung and kong are treated as equal priority.',
  },
  {
    rank: 3,
    claim: 'Chow',
    detail: 'Lowest priority, and only available to the player immediately to the discarder\'s right.',
  },
]

export const CLAIM_PRIORITY_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://www.sloperama.com/mjfaq/mjfaq20.html',
    'https://groups.google.com/g/rec.games.mahjong/c/ZuldIcjFcS8',
    'https://mahjongbritishrules.wordpress.com/the-game/playing-the-game/',
  ],
  note:
    'Win > pung/kong > chow is near-universal. Tables differ on multi-winner discards: some pay every winner, some only the nearest player, some declare a washout. Agree this before you deal.',
}

/** Hand shape differs between the two rulesets — this is the headline difference. */
export interface HandShape {
  ruleset: Ruleset
  tilesInHand: number
  tilesOnWin: number
  sets: number
  pairs: number
  summary: string
  sourcing: Sourced
}

export const HAND_SHAPES: Record<Ruleset, HandShape> = {
  hongKong: {
    ruleset: 'hongKong',
    tilesInHand: 13,
    tilesOnWin: 14,
    sets: 4,
    pairs: 1,
    summary: 'Hold 13 tiles. Win with a 14th: four sets plus one pair.',
    sourcing: {
      confidence: 'established',
      sources: ['https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring'],
    },
  },
  taiwanese: {
    ruleset: 'taiwanese',
    tilesInHand: 16,
    tilesOnWin: 17,
    sets: 5,
    pairs: 1,
    summary: 'Hold 16 tiles. Win with a 17th: five sets plus one pair.',
    sourcing: {
      confidence: 'established',
      sources: [
        'https://4windsmj.com/kb/rules/taiwanese/',
        'https://rackitmahjong.com/blogs/mahjong/how-to-play-taiwanese-mahjong-your-comprehensive-guide-to-the-16-tile-hand',
      ],
    },
  },
}

/**
 * Pure legality check for claiming a chow, expressed in seat offsets.
 * Seats are indexed 0–3 in turn order (East, South, West, North).
 * Play runs counter-clockwise, so the next player is (seat + 1) % 4.
 */
export function canClaimChow(discarderSeat: number, claimantSeat: number): boolean {
  return (discarderSeat + 1) % 4 === claimantSeat
}

/** Numeric priority for resolving competing claims. Higher wins. */
export function claimPriority(claim: 'win' | 'pung' | 'kong' | 'chow'): number {
  switch (claim) {
    case 'win':
      return 3
    case 'pung':
    case 'kong':
      return 2
    case 'chow':
      return 1
  }
}

/**
 * Resolve competing claims on one discard.
 * Returns the winning claimant, or undefined if nobody claimed.
 */
export interface Claim {
  seat: number
  claim: 'win' | 'pung' | 'kong' | 'chow'
}

export function resolveClaims(discarderSeat: number, claims: readonly Claim[]): Claim | undefined {
  const legal = claims.filter((c) => (c.claim === 'chow' ? canClaimChow(discarderSeat, c.seat) : true))
  if (legal.length === 0) return undefined
  const best = Math.max(...legal.map((c) => claimPriority(c.claim)))
  const contenders = legal.filter((c) => claimPriority(c.claim) === best)
  // Ties break by seat distance from the discarder, going counter-clockwise.
  return contenders.reduce((closest, c) =>
    seatDistance(discarderSeat, c.seat) < seatDistance(discarderSeat, closest.seat) ? c : closest,
  )
}

function seatDistance(from: number, to: number): number {
  return (to - from + 4) % 4
}
