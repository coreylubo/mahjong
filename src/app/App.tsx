/**
 * The shell (spec §2).
 *
 * There is no header and no nav rail any more. Ruleset and terminology are set
 * once before a game and live behind the floating nav; the sections are one tap
 * away in that same place. What is left is content, edge to edge — in landscape
 * on a phone that is the whole point, since the reference tables are why anyone
 * opened this.
 *
 * Mantine's AppShell went with the chrome it was laying out. With no header or
 * navbar left to position around, a plain <main> carrying the safe-area insets
 * is less machinery for the same result.
 */
import { useState } from 'react'

import { SectionNav } from './components/SectionNav'
import { SECTIONS, type SectionId } from './navigation'

export function App() {
  const [active, setActive] = useState<SectionId>('tiles')
  const Active = SECTIONS.find((section) => section.id === active)!.Component

  return (
    <>
      <main className="app-main">
        <Active />
      </main>

      <SectionNav active={active} onNavigate={setActive} />
    </>
  )
}
