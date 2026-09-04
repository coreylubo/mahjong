import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  TILES,
  TOTAL_TILES,
  SET_COMPOSITION,
  TILES_BY_ID,
  bonusTileSeat,
  advanceRound,
  INITIAL_ROUND,
  seatWindForPlayer,
  resolveClaims,
  canClaimChow,
  term,
  termWithEnglish,
  TERMS,
  faanToPoints,
  HK_POINTS_TABLE_NEW_STYLE,
  HK_POINTS_TABLE_CLASSICAL,
  classicalDoublings,
  hongKongPayout,
  taiToAmount,
  taiwanesePayout,
  createScorekeeper,
  scorekeeperReducer,
  totals,
  standings,
  SCORING_BY_RULESET,
} from './index'

// ---------------------------------------------------------------------------
// Portability contract (spec §7.1) — this is the test that keeps the promise.
// ---------------------------------------------------------------------------

const FORBIDDEN_IN_CORE = ['react', 'react-dom', '@mantine/', 'react-native']

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('core stays portable', () => {
  it('never imports a rendering framework', () => {
    const offenders: string[] = []
    for (const file of walk(join(process.cwd(), 'src/core'))) {
      if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const specifier = match[1]!
        if (FORBIDDEN_IN_CORE.some((banned) => specifier === banned || specifier.startsWith(banned))) {
          offenders.push(`${file} imports ${specifier}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Tiles
// ---------------------------------------------------------------------------

describe('tile data', () => {
  it('describes a standard 144-tile set', () => {
    expect(TOTAL_TILES).toBe(144)
    expect(SET_COMPOSITION.reduce((n, g) => n + g.count, 0)).toBe(144)
  })

  it('has 42 distinct tiles: 27 suited, 7 honours, 8 bonus', () => {
    expect(TILES).toHaveLength(42)
    expect(TILES.filter((t) => t.kind === 'suit')).toHaveLength(27)
    expect(TILES.filter((t) => t.kind === 'wind' || t.kind === 'dragon')).toHaveLength(7)
    expect(TILES.filter((t) => t.kind === 'flower' || t.kind === 'season')).toHaveLength(8)
  })

  it('total copies match the set composition', () => {
    expect(TILES.reduce((n, t) => n + t.copies, 0)).toBe(144)
  })

  it('gives every tile a unique id and a recognition hint', () => {
    expect(Object.keys(TILES_BY_ID)).toHaveLength(TILES.length)
    expect(TILES.every((t) => t.recognition.length > 0)).toBe(true)
  })

  it('calls out 1 Bamboo as a bird, not a stick', () => {
    expect(TILES_BY_ID['b1']!.recognition).toMatch(/bird/i)
  })

  it('maps numbered bonus tiles to seat winds', () => {
    expect(bonusTileSeat(TILES_BY_ID['f1']!)).toBe('east')
    expect(bonusTileSeat(TILES_BY_ID['s4']!)).toBe('north')
    expect(bonusTileSeat(TILES_BY_ID['b5']!)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Terminology
// ---------------------------------------------------------------------------

describe('terminology', () => {
  it('resolves the same key across languages and scripts', () => {
    expect(term('pung', { language: 'en', script: 'romanized' })).toBe('Pung')
    expect(term('pung', { language: 'cantonese', script: 'characters' })).toBe('碰')
    expect(term('pung', { language: 'mandarin', script: 'romanized' })).toBe('pèng')
  })

  it('falls back to the key rather than rendering blank', () => {
    expect(term('not-a-real-term', { language: 'cantonese', script: 'characters' })).toBe('not-a-real-term')
  })

  it('pairs a non-English term with its English name', () => {
    expect(termWithEnglish('kong', { language: 'cantonese', script: 'characters' })).toBe('槓 (Kong)')
    expect(termWithEnglish('kong', { language: 'en', script: 'romanized' })).toBe('Kong')
  })

  it('has every language filled in for every entry', () => {
    for (const entry of Object.values(TERMS)) {
      expect(entry.en).toBeTruthy()
      expect(entry.cantonese.romanized).toBeTruthy()
      expect(entry.cantonese.characters).toBeTruthy()
      expect(entry.mandarin.romanized).toBeTruthy()
      expect(entry.mandarin.characters).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// Turn flow
// ---------------------------------------------------------------------------

describe('round tracker', () => {
  it('keeps the deal when the dealer wins', () => {
    const next = advanceRound(INITIAL_ROUND, { type: 'win', winnerSeat: 0 })
    expect(next.dealerSeat).toBe(0)
    expect(next.dealerStreak).toBe(1)
  })

  it('passes the deal counter-clockwise when someone else wins', () => {
    const next = advanceRound(INITIAL_ROUND, { type: 'win', winnerSeat: 2 })
    expect(next.dealerSeat).toBe(1)
    expect(next.dealerStreak).toBe(0)
    expect(next.roundWind).toBe('east')
  })

  it('advances the round wind once the deal returns to the starting seat', () => {
    let state = INITIAL_ROUND
    for (let i = 0; i < 4; i += 1) {
      state = advanceRound(state, { type: 'win', winnerSeat: (state.dealerSeat + 1) % 4 })
    }
    expect(state.dealerSeat).toBe(0)
    expect(state.roundWind).toBe('south')
  })

  it('honours the house rule for a washout', () => {
    expect(advanceRound(INITIAL_ROUND, { type: 'draw' }).dealerSeat).toBe(0)
    expect(
      advanceRound(INITIAL_ROUND, { type: 'draw' }, { dealerKeepsDealOnDraw: false }).dealerSeat,
    ).toBe(1)
  })

  it('assigns seat winds relative to the current dealer', () => {
    expect(seatWindForPlayer(0, 0)).toBe('east')
    expect(seatWindForPlayer(1, 0)).toBe('south')
    // Dealer moves to seat 2 — seat 2 is now East.
    expect(seatWindForPlayer(2, 2)).toBe('east')
    expect(seatWindForPlayer(0, 2)).toBe('west')
  })
})

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

describe('claim resolution', () => {
  it('only lets the next player in turn order chow', () => {
    expect(canClaimChow(0, 1)).toBe(true)
    expect(canClaimChow(0, 2)).toBe(false)
    expect(canClaimChow(3, 0)).toBe(true)
  })

  it('lets a win beat a pung', () => {
    const winner = resolveClaims(0, [
      { seat: 1, claim: 'pung' },
      { seat: 3, claim: 'win' },
    ])
    expect(winner).toEqual({ seat: 3, claim: 'win' })
  })

  it('lets a pung beat a chow even when the chow player is next', () => {
    const winner = resolveClaims(0, [
      { seat: 1, claim: 'chow' },
      { seat: 2, claim: 'pung' },
    ])
    expect(winner).toEqual({ seat: 2, claim: 'pung' })
  })

  it('breaks ties by nearest seat after the discarder', () => {
    const winner = resolveClaims(3, [
      { seat: 2, claim: 'win' },
      { seat: 0, claim: 'win' },
    ])
    expect(winner).toEqual({ seat: 0, claim: 'win' })
  })

  it('discards an illegal chow claim', () => {
    expect(resolveClaims(0, [{ seat: 2, claim: 'chow' }])).toBeUndefined()
  })

  it('returns nothing when nobody claims', () => {
    expect(resolveClaims(0, [])).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Scoring and payout
// ---------------------------------------------------------------------------

describe('hong kong payout — New Style', () => {
  // Transcribed from the Payment Table on the supplied New Style rule sheet.
  it('matches the published chart exactly', () => {
    const published = [1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384]
    expect([...HK_POINTS_TABLE_NEW_STYLE]).toEqual(published)
    published.forEach((points, faan) => {
      expect(faanToPoints(faan), `${faan} faan`).toBe(points)
    })
  })

  it('is not a plain doubling ladder above 4 faan', () => {
    // 5 faan is 24, not 32 — the chart tapers. Getting this wrong overpays.
    expect(faanToPoints(5)).toBe(24)
    expect(faanToPoints(7)).toBe(48)
  })

  it('caps at the table limit', () => {
    expect(faanToPoints(20)).toBe(384)
    expect(faanToPoints(12, { minimumFaan: 3, limitFaan: 10, paymentStyle: 'newStyle' })).toBe(128)
  })

  it('charges the discarder double and nobody else', () => {
    const payout = hongKongPayout({ faan: 4, winnerSeat: 0, discarderSeat: 2 })
    expect(payout.perSeat).toEqual({ 0: 0, 1: 0, 2: 32, 3: 0 })
    expect(payout.winnerReceives).toBe(32)
  })

  it('charges all three face value on a self-draw', () => {
    const payout = hongKongPayout({ faan: 4, winnerSeat: 0 })
    expect(payout.perSeat).toEqual({ 0: 0, 1: 16, 2: 16, 3: 16 })
    expect(payout.winnerReceives).toBe(48)
  })

  it('ignores the dealer seat entirely', () => {
    const withDealer = hongKongPayout({ faan: 4, winnerSeat: 0, discarderSeat: 2, dealerSeat: 2 })
    const without = hongKongPayout({ faan: 4, winnerSeat: 0, discarderSeat: 2 })
    expect(withDealer.perSeat).toEqual(without.perSeat)
  })
})

describe('hong kong payout — Classical', () => {
  const CLASSICAL = { minimumFaan: 0, limitFaan: 13, paymentStyle: 'classical' as const }

  it('matches the published banded chart exactly', () => {
    // Sheet prints bands: 0, 1, 2, 3, then 4-6, 7-9, 10-12, 13+.
    const published = [1, 2, 4, 8, 16, 16, 16, 32, 32, 32, 64, 64, 64, 128]
    expect([...HK_POINTS_TABLE_CLASSICAL]).toEqual(published)
    published.forEach((points, faan) => {
      expect(faanToPoints(faan, CLASSICAL), `${faan} faan`).toBe(points)
    })
  })

  it('bands consecutive faan to the same points', () => {
    expect(faanToPoints(4, CLASSICAL)).toBe(faanToPoints(6, CLASSICAL))
    expect(faanToPoints(7, CLASSICAL)).toBe(faanToPoints(9, CLASSICAL))
    // ...and is flatter than New Style at the top end.
    expect(faanToPoints(13, CLASSICAL)).toBeLessThan(faanToPoints(13))
  })

  it('counts the doublings the sheet lists, and stacks them', () => {
    // Non-dealer wins off a non-dealer; seat 0 deals and loses.
    const win = { winnerSeat: 1, discarderSeat: 2, dealerSeat: 0 }
    expect(classicalDoublings(3, win)).toBe(0) // uninvolved
    expect(classicalDoublings(2, win)).toBe(1) // fed the winning tile
    expect(classicalDoublings(0, win)).toBe(1) // dealer, lost

    // Dealer self-draws: self-pick doubles everyone, dealer-wins doubles again.
    const dealerSelfDraw = { winnerSeat: 0, discarderSeat: undefined, dealerSeat: 0 }
    expect(classicalDoublings(1, dealerSelfDraw)).toBe(2)

    // Dealer discards into a non-dealer's win: the dealer is both the
    // discarder and the losing dealer, so two doublings stack.
    const dealerDealsIn = { winnerSeat: 1, discarderSeat: 0, dealerSeat: 0 }
    expect(classicalDoublings(0, dealerDealsIn)).toBe(2)
  })

  it('charges everyone, with the discarder and the dealer doubled', () => {
    const payout = hongKongPayout({
      faan: 5, // base 16 under Classical
      winnerSeat: 1,
      discarderSeat: 2,
      dealerSeat: 0,
      rules: CLASSICAL,
    })
    expect(payout.perSeat).toEqual({ 0: 32, 1: 0, 2: 32, 3: 16 })
    expect(payout.winnerReceives).toBe(80)
  })

  it('quadruples every payment when the dealer self-draws', () => {
    const payout = hongKongPayout({
      faan: 5,
      winnerSeat: 0,
      dealerSeat: 0,
      rules: CLASSICAL,
    })
    expect(payout.perSeat).toEqual({ 0: 0, 1: 64, 2: 64, 3: 64 })
    expect(payout.winnerReceives).toBe(192)
  })

  it('charges a dealer who deals in 4x — both doublings stack', () => {
    const payout = hongKongPayout({
      faan: 5,
      winnerSeat: 1,
      discarderSeat: 0,
      dealerSeat: 0,
      rules: CLASSICAL,
    })
    expect(payout.perSeat[0]).toBe(64)
    expect(payout.perSeat[2]).toBe(16)
  })

  it('still pays out, and says so, when no dealer seat is given', () => {
    const payout = hongKongPayout({ faan: 5, winnerSeat: 1, discarderSeat: 2, rules: CLASSICAL })
    expect(payout.perSeat).toEqual({ 0: 16, 1: 0, 2: 32, 3: 16 })
    expect(payout.explanation).toMatch(/Dealer doubling not applied/)
  })

  it('always leaves the winner paying nothing', () => {
    for (const discarderSeat of [undefined, 0, 2, 3]) {
      for (const dealerSeat of [0, 1, 2, 3]) {
        const payout = hongKongPayout({ faan: 6, winnerSeat: 1, discarderSeat, dealerSeat, rules: CLASSICAL })
        expect(payout.perSeat[1]).toBe(0)
        const collected = Object.values(payout.perSeat).reduce((a, b) => a + b, 0)
        expect(payout.winnerReceives).toBe(collected)
      }
    }
  })
})

describe('taiwanese payout', () => {
  it('matches the worked example from the sources: base 3, factor 2, 5 tai = 13', () => {
    expect(taiToAmount(5)).toBe(13)
  })

  it('charges the discarder alone', () => {
    const payout = taiwanesePayout({ tai: 5, winnerSeat: 1, discarderSeat: 3 })
    expect(payout.perSeat).toEqual({ 0: 0, 1: 0, 2: 0, 3: 13 })
    expect(payout.winnerReceives).toBe(13)
  })

  it('charges all three on a self-draw', () => {
    const payout = taiwanesePayout({ tai: 5, winnerSeat: 1 })
    expect(payout.winnerReceives).toBe(39)
  })
})

describe('scoring tables', () => {
  it('carries sources on every single pattern (spec §8)', () => {
    for (const ruleset of ['hongKong', 'taiwanese'] as const) {
      for (const pattern of SCORING_BY_RULESET[ruleset].patterns) {
        expect(pattern.sourcing.sources.length).toBeGreaterThan(0)
        expect(pattern.description.length).toBeGreaterThan(0)
      }
    }
  })

  it('gives every pattern a unique id', () => {
    for (const ruleset of ['hongKong', 'taiwanese'] as const) {
      const ids = SCORING_BY_RULESET[ruleset].patterns.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('only ever replaces a pattern that exists', () => {
    for (const ruleset of ['hongKong', 'taiwanese'] as const) {
      const patterns = SCORING_BY_RULESET[ruleset].patterns
      const ids = new Set(patterns.map((p) => p.id))
      for (const pattern of patterns) {
        if (pattern.replaces) {
          expect(ids.has(pattern.replaces), `${pattern.id} replaces missing ${pattern.replaces}`).toBe(true)
          expect(pattern.replaces).not.toBe(pattern.id)
        }
      }
    }
  })

  it('scores a replacement higher than the pattern it replaces', () => {
    // The whole point of `replaces` is that the bigger hand supersedes the
    // smaller one. A replacement worth less would mean a transcription error.
    for (const ruleset of ['hongKong', 'taiwanese'] as const) {
      const patterns = SCORING_BY_RULESET[ruleset].patterns
      for (const pattern of patterns) {
        if (!pattern.replaces) continue
        const parent = patterns.find((p) => p.id === pattern.replaces)!
        expect(pattern.value, `${pattern.id} vs ${parent.id}`).toBeGreaterThan(parent.value)
      }
    }
  })

  it('explains itself wherever confidence is not established', () => {
    for (const ruleset of ['hongKong', 'taiwanese'] as const) {
      for (const pattern of SCORING_BY_RULESET[ruleset].patterns) {
        if (pattern.sourcing.confidence !== 'established') {
          expect(pattern.sourcing.note, `${pattern.id} needs a note`).toBeTruthy()
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Scorekeeper
// ---------------------------------------------------------------------------

describe('scorekeeper', () => {
  it('starts empty with four seats', () => {
    const state = createScorekeeper()
    expect(state.players).toHaveLength(4)
    expect(state.hands).toHaveLength(0)
    expect(totals(state)).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
  })

  it('records a discard win with deltas that sum to zero', () => {
    // Defaults to the New Style payment system.
    const state = scorekeeperReducer(createScorekeeper(), {
      type: 'recordWin',
      id: 'h1',
      input: { ruleset: 'hongKong', winnerSeat: 0, discarderSeat: 2, score: 4 },
    })
    // 4 faan = 16 points; the discarder alone pays double.
    const result = totals(state)
    expect(result).toEqual({ 0: 32, 1: 0, 2: -32, 3: 0 })
    expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(0)
  })

  it('records a self-draw against all three opponents', () => {
    const state = scorekeeperReducer(createScorekeeper(), {
      type: 'recordWin',
      id: 'h1',
      input: { ruleset: 'hongKong', winnerSeat: 1, score: 4 },
    })
    // 4 faan = 16 points; all three opponents pay face value.
    expect(totals(state)).toEqual({ 0: -16, 1: 48, 2: -16, 3: -16 })
  })

  it('accumulates across hands and undoes the last one', () => {
    let state = createScorekeeper()
    state = scorekeeperReducer(state, {
      type: 'recordWin',
      id: 'h1',
      input: { ruleset: 'hongKong', winnerSeat: 0, discarderSeat: 1, score: 5 },
    })
    state = scorekeeperReducer(state, {
      type: 'recordWin',
      id: 'h2',
      input: { ruleset: 'hongKong', winnerSeat: 2, discarderSeat: 0, score: 3 },
    })
    // Hand 1: 5 faan = 24 points, doubled = 48. Hand 2: 3 faan = 8, doubled = 16.
    expect(totals(state)).toEqual({ 0: 32, 1: -48, 2: 16, 3: 0 })

    state = scorekeeperReducer(state, { type: 'undo' })
    expect(state.hands).toHaveLength(1)
    expect(totals(state)).toEqual({ 0: 48, 1: -48, 2: 0, 3: 0 })
  })

  it('records a washout with nobody paying', () => {
    const state = scorekeeperReducer(createScorekeeper(), { type: 'recordDraw', id: 'h1' })
    expect(totals(state)).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0 })
    expect(state.hands[0]!.winnerSeat).toBeNull()
  })

  it('renames a seat without touching the hand log', () => {
    let state = scorekeeperReducer(createScorekeeper(), { type: 'recordDraw', id: 'h1' })
    state = scorekeeperReducer(state, { type: 'renamePlayer', seat: 2, name: 'Sam' })
    expect(state.players[2]!.name).toBe('Sam')
    expect(state.hands).toHaveLength(1)
  })

  it('ranks standings highest first', () => {
    let state = createScorekeeper(['A', 'B', 'C', 'D'])
    state = scorekeeperReducer(state, {
      type: 'recordWin',
      id: 'h1',
      input: { ruleset: 'taiwanese', winnerSeat: 3, score: 5 },
    })
    const ranked = standings(state)
    expect(ranked[0]!.player.name).toBe('D')
    expect(ranked[0]!.total).toBe(39)
  })

  it('resets the hand log but keeps the players', () => {
    let state = scorekeeperReducer(createScorekeeper(['A', 'B', 'C', 'D']), { type: 'recordDraw', id: 'h1' })
    state = scorekeeperReducer(state, { type: 'reset' })
    expect(state.hands).toHaveLength(0)
    expect(state.players[0]!.name).toBe('A')
  })
})
