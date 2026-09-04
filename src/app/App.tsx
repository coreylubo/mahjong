import { useState } from 'react'
import {
  AppShell,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import { TableSettings } from './components/TableSettings'
import { SetupSection } from './sections/Setup'
import { TurnFlowSection } from './sections/TurnFlow'
import { TileReferenceSection } from './sections/TileReference'
import { MeldsActionsSection } from './sections/MeldsActions'
import { ScoringReferenceSection } from './sections/ScoringReference'
import { ScorekeeperSection } from './sections/Scorekeeper'

const SECTIONS = [
  { id: 'setup', label: 'Setup', hint: 'Before the first tile', Component: SetupSection },
  { id: 'turn', label: 'Turn Flow', hint: 'Whose go, and what happens', Component: TurnFlowSection },
  { id: 'tiles', label: 'Tiles', hint: 'What am I holding?', Component: TileReferenceSection },
  { id: 'melds', label: 'Melds', hint: 'Can I claim that?', Component: MeldsActionsSection },
  { id: 'scoring', label: 'Scoring', hint: 'What is it worth?', Component: ScoringReferenceSection },
  { id: 'scores', label: 'Scores', hint: 'Table running total', Component: ScorekeeperSection },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

/**
 * Flat navigation, one tap deep (spec §2). Sections sit in a left rail so that
 * in landscape — the intended orientation — switching costs one thumb reach and
 * the content area keeps the full width.
 */
export function App() {
  const [active, setActive] = useState<SectionId>('tiles')
  const Active = SECTIONS.find((section) => section.id === active)!.Component

  return (
    <AppShell
      // The safe-area insets are folded into the shell's own dimensions so
      // Mantine's layout maths — which offsets Main by exactly these values —
      // still lines up once the notch is accounted for. See app.css.
      navbar={{ width: 'calc(118px + var(--safe-left))', breakpoint: 0 }}
      padding="sm"
    >

      <AppShell.Navbar className="app-navbar" bg="dark.7">
        <Stack gap={6} h="100%">
          {/*
            Six sections plus the gear are taller than a phone in landscape, so
            the section list scrolls inside itself and the gear stays pinned to
            the foot of the rail. `minHeight: 0` is what actually lets a flex
            child shrink far enough to scroll — without it the list keeps its
            full content height and pushes the gear off-screen.
          */}
          <Stack gap={6} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {SECTIONS.map((section) => (
              <UnstyledButton
                key={section.id}
                className="section-tab"
                onClick={() => setActive(section.id)}
                px="sm"
                py={8}
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  background:
                    active === section.id ? 'var(--mantine-color-jade-light)' : 'transparent',
                }}
              >
                <Text size="sm" fw={600} c={active === section.id ? 'jade.3' : undefined}>
                  {section.label}
                </Text>
                <Text size="10px" c="dimmed" lh={1.25}>
                  {section.hint}
                </Text>
              </UnstyledButton>
            ))}
          </Stack>

          {/* Set once before the first hand, so it sits out of the way. */}
          <TableSettings />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="app-main">
        <Active />
      </AppShell.Main>
    </AppShell>
  )
}
