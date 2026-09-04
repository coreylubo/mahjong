import { useState } from 'react'
import {
  AppShell,
  Badge,
  Group,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'

import type { Ruleset, TermLanguage, TermScript } from '../core'
import { RULESET_LABELS, useSettings } from './settings'
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
  const { ruleset, setRuleset, terminology, setTerminology } = useSettings()
  const Active = SECTIONS.find((section) => section.id === active)!.Component

  return (
    <AppShell
      // The safe-area insets are folded into the shell's own dimensions so
      // Mantine's layout maths — which offsets Main by exactly these values —
      // still lines up once the notch is accounted for. See app.css.
      header={{ height: 'calc(48px + var(--safe-top))' }}
      navbar={{ width: 'calc(118px + var(--safe-left))', breakpoint: 0 }}
      padding="sm"
    >
      <AppShell.Header className="app-header" bg="dark.7">
        <Group h="100%" justify="space-between" wrap="nowrap" gap="xs">
          <Title order={5} style={{ whiteSpace: 'nowrap' }}>
            Mahjong
          </Title>

          <Group gap="xs" wrap="nowrap">
            <SegmentedControl
              size="xs"
              value={ruleset}
              onChange={(value) => setRuleset(value as Ruleset)}
              data={(['hongKong', 'taiwanese'] as const).map((id) => ({
                value: id,
                label: RULESET_LABELS[id],
              }))}
            />
            <TerminologyMenu
              terminology={terminology}
              onChange={setTerminology}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="app-navbar" bg="dark.7">
        <Stack gap={6}>
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
      </AppShell.Navbar>

      <AppShell.Main className="app-main">
        <Active />
      </AppShell.Main>
    </AppShell>
  )
}

function TerminologyMenu({
  terminology,
  onChange,
}: {
  terminology: { language: TermLanguage; script: TermScript }
  onChange: (value: { language: TermLanguage; script: TermScript }) => void
}) {
  const languageLabel: Record<TermLanguage, string> = {
    en: 'English',
    cantonese: 'Cantonese',
    mandarin: 'Mandarin',
  }

  return (
    <Menu shadow="md" width={230} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Badge variant="light" size="md" radius="sm" style={{ cursor: 'pointer' }}>
            {languageLabel[terminology.language]}
            {terminology.language !== 'en' && (terminology.script === 'characters' ? ' 漢' : ' ab')}
          </Badge>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Show game terms in</Menu.Label>
        {(['en', 'cantonese', 'mandarin'] as const).map((language) => (
          <Menu.Item
            key={language}
            onClick={() => onChange({ ...terminology, language })}
            bg={terminology.language === language ? 'dark.5' : undefined}
          >
            {languageLabel[language]}
          </Menu.Item>
        ))}

        {terminology.language !== 'en' && (
          <>
            <Menu.Divider />
            <Menu.Label>Written as</Menu.Label>
            {(['romanized', 'characters'] as const).map((script) => (
              <Menu.Item
                key={script}
                onClick={() => onChange({ ...terminology, script })}
                bg={terminology.script === script ? 'dark.5' : undefined}
              >
                {script === 'romanized' ? 'Romanized (pung, gong)' : 'Characters (碰, 槓)'}
              </Menu.Item>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
