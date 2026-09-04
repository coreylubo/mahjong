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
   * Which seat the person holding the phone is sitting in (0-3).
   *
   * Seats are fixed for the whole game; it is the WIND labels that rotate as
   * the deal passes. So this is set once and the tracker derives your wind from
   * it and the current dealer.
   */
  mySeat: number
  setMySeat: (seat: number) => void
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
  const [mySeat, setMySeat] = useState(0)
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
      mySeat,
      setMySeat,
      groupTerm,
      setGroupTerm,
      groupWord: (plural = false) =>
        groupTerm === 'melds' ? (plural ? 'melds' : 'meld') : plural ? 'sets' : 'set',
      t: (key: string) => resolveTerm(key, terminology),
      tEn: (key: string) => resolveTermWithEnglish(key, terminology),
    }),
    [ruleset, terminology, hkPaymentStyle, round, mySeat, groupTerm],
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
