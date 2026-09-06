/**
 * App-wide state: ruleset, terminology, and where the table has got to (spec §5).
 *
 * This is the one place the UI layer is allowed to hold game-related state. It
 * stores *choices* and *position* — never rules, which all live in src/core and
 * reach this file only as pure functions like `advanceRound`.
 *
 * The round moved here when the tracker became a floating control rather than a
 * card inside one section. It is read from the tracker and, in principle, from
 * anywhere else that cares whose deal it is, so it cannot live in a section's
 * local state any more.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/** What to call a group of matched tiles. See `groupTerm` below. */
export type GroupTerm = 'melds' | 'sets'

/**
 * You are always seat 0, and always drawn at the bottom of the table.
 *
 * Every player reads a table from their own chair, so fixing this removes both
 * a setting and the mental rotation that came with it.
 */
export const MY_SEAT = 0

/**
 * Seat 1 is to your right, which is where play goes next.
 *
 * The defaults are deliberately not "Right"/"Across"/"Left": every seat is
 * already labelled with its position, so naming them that too would say the
 * same thing twice and read as a bug once real names are typed in.
 */
export const DEFAULT_PLAYER_NAMES: readonly string[] = [
  'You',
  'Player 2',
  'Player 3',
  'Player 4',
]

import {
  DEFAULT_TERMINOLOGY,
  INITIAL_ROUND,
  term as resolveTerm,
  termWithEnglish as resolveTermWithEnglish,
  type PaymentStyle,
  type RoundState,
  type Ruleset,
  type TerminologySetting,
} from '../core'

interface SettingsValue {
  ruleset: Ruleset
  setRuleset: (ruleset: Ruleset) => void
  terminology: TerminologySetting
  setTerminology: (terminology: TerminologySetting) => void
  /**
   * Which Hong Kong payment system the table plays. Decides both the points
   * chart and who pays what, so it lives here rather than per-screen.
   */
  hkPaymentStyle: PaymentStyle
  setHkPaymentStyle: (style: PaymentStyle) => void
  /** Where the table has got to: round wind, whose deal, which hand. */
  round: RoundState
  setRound: (round: RoundState) => void
  /**
   * Who is sitting where, by seat index.
   *
   * Seat 0 is ALWAYS you — every diagram draws the table from your chair, so
   * there is no "which seat am I" to set and no mental rotation to do. The
   * other three are named by where they sit relative to you, and seats never
   * move: it is the WIND labels that rotate as the deal passes.
   */
  playerNames: readonly string[]
  setPlayerName: (seat: number, name: string) => void
  /**
   * Whether a group of matched tiles is called a "meld" or a "set".
   *
   * Both are in wide use and neither is more correct. English-language mahjong
   * writing leans "meld"; players who came from other tile and card games, and
   * most Taiwanese material in translation, say "set". Rather than pick one and
   * quietly teach the reader a word their table does not use, it is a switch.
   */
  groupTerm: GroupTerm
  setGroupTerm: (value: GroupTerm) => void
  /** The chosen word, singular or plural. */
  groupWord: (plural?: boolean) => string
  /** Resolve a term key for the current setting. */
  t: (key: string) => string
  /** Resolve a term key, appending the English name when it differs. */
  tEn: (key: string) => string
}

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ruleset, setRuleset] = useState<Ruleset>('hongKong')
  const [terminology, setTerminology] = useState<TerminologySetting>(DEFAULT_TERMINOLOGY)
  const [hkPaymentStyle, setHkPaymentStyle] = useState<PaymentStyle>('newStyle')
  const [round, setRound] = useState<RoundState>(INITIAL_ROUND)
  const [playerNames, setPlayerNames] = useState<readonly string[]>(DEFAULT_PLAYER_NAMES)
  const [groupTerm, setGroupTerm] = useState<GroupTerm>('melds')

  const value = useMemo<SettingsValue>(
    () => ({
      ruleset,
      setRuleset,
      terminology,
      setTerminology,
      hkPaymentStyle,
      setHkPaymentStyle,
      round,
      setRound,
      playerNames,
      setPlayerName: (seat: number, name: string) =>
        setPlayerNames((current) => current.map((existing, i) => (i === seat ? name : existing))),
      groupTerm,
      setGroupTerm,
      groupWord: (plural = false) =>
        groupTerm === 'melds' ? (plural ? 'melds' : 'meld') : plural ? 'sets' : 'set',
      t: (key: string) => resolveTerm(key, terminology),
      tEn: (key: string) => resolveTermWithEnglish(key, terminology),
    }),
    [ruleset, terminology, hkPaymentStyle, round, playerNames, groupTerm],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside a SettingsProvider')
  return value
}

export const RULESET_LABELS: Record<Ruleset, string> = {
  hongKong: 'Hong Kong',
  taiwanese: 'Taiwanese',
}

export const PAYMENT_STYLE_LABELS: Record<PaymentStyle, string> = {
  newStyle: 'New Style',
  classical: 'Classical',
}
