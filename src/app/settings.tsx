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
  type PaymentStyle,
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

  const value = useMemo<SettingsValue>(
    () => ({
      ruleset,
      setRuleset,
      terminology,
      setTerminology,
      hkPaymentStyle,
      setHkPaymentStyle,
      t: (key: string) => resolveTerm(key, terminology),
      tEn: (key: string) => resolveTermWithEnglish(key, terminology),
    }),
    [ruleset, terminology, hkPaymentStyle],
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
