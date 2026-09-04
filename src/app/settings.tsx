/**
 * App-wide settings: ruleset and terminology (spec §5).
 *
 * This is the one place the UI layer is allowed to hold game-related state.
 * It stores *choices*, not rules — the rules themselves all live in src/core.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import {
  DEFAULT_TERMINOLOGY,
  term as resolveTerm,
  termWithEnglish as resolveTermWithEnglish,
  type Ruleset,
  type TerminologySetting,
} from '../core'

interface SettingsValue {
  ruleset: Ruleset
  setRuleset: (ruleset: Ruleset) => void
  terminology: TerminologySetting
  setTerminology: (terminology: TerminologySetting) => void
  /** Resolve a term key for the current setting. */
  t: (key: string) => string
  /** Resolve a term key, appending the English name when it differs. */
  tEn: (key: string) => string
}

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ruleset, setRuleset] = useState<Ruleset>('hongKong')
  const [terminology, setTerminology] = useState<TerminologySetting>(DEFAULT_TERMINOLOGY)

  const value = useMemo<SettingsValue>(
    () => ({
      ruleset,
      setRuleset,
      terminology,
      setTerminology,
      t: (key: string) => resolveTerm(key, terminology),
      tEn: (key: string) => resolveTermWithEnglish(key, terminology),
    }),
    [ruleset, terminology],
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
