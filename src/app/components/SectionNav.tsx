/**
 * Floating section nav — a hamburger in the lower left (spec §2).
 *
 * WHY FLOATING RATHER THAN A RAIL.
 * The rail this replaces was 118px of permanent width. In landscape on a phone
 * that is roughly a seventh of the screen, spent on a control used once every
 * few minutes — while the reference tables it squeezed are the reason anyone
 * opened the app. Floating gives that width back to the content and costs one
 * extra tap to switch section.
 *
 * WHY LOWER LEFT.
 * The device is usually flat on the table, and the menu opens upward into the
 * screen rather than off the bottom edge. Lower left also keeps it clear of the
 * right-hand detail panels several sections use.
 *
 * The button is deliberately large — 56px, well over the 44px touch minimum —
 * because it gets tapped mid-hand, one-handed, often without looking.
 */
import { useState } from 'react'
import { ActionIcon, Menu, Stack, Text } from '@mantine/core'
import { IconMenu2, IconSettings } from '@tabler/icons-react'

import { SECTIONS, type SectionId } from '../navigation'
import { RULESET_LABELS, useSettings } from '../settings'
import { LANGUAGE_LABELS, TableSettingsModal } from './TableSettings'

export function SectionNav({
  active,
  onNavigate,
}: {
  active: SectionId
  onNavigate: (id: SectionId) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { ruleset, terminology } = useSettings()

  return (
    <>
      <Menu
        position="top-start"
        offset={12}
        width={232}
        radius="md"
        shadow="xl"
        transitionProps={{ transition: 'pop-bottom-left' }}
      >
        <Menu.Target>
          <ActionIcon
            className="nav-fab"
            size={56}
            radius="xl"
            variant="filled"
            color="jade"
            aria-label="Sections"
          >
            <IconMenu2 size={26} stroke={2} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Go to</Menu.Label>
          {SECTIONS.map((section) => (
            <Menu.Item
              key={section.id}
              onClick={() => onNavigate(section.id)}
              bg={active === section.id ? 'var(--mantine-color-jade-light)' : undefined}
            >
              <Text size="sm" fw={600} c={active === section.id ? 'jade.3' : undefined}>
                {section.label}
              </Text>
            </Menu.Item>
          ))}

          <Menu.Divider />

          <Menu.Item
            leftSection={<IconSettings size={16} />}
            onClick={() => setSettingsOpen(true)}
          >
            <Stack gap={0}>
              <Text size="sm" fw={600}>
                Table settings
              </Text>
              {/*
                The ruleset decides what a hand is worth, so it stays readable
                without opening anything.
              */}
              <Text size="10px" c="jade.4" fw={700} lh={1.25}>
                {RULESET_LABELS[ruleset]} · {LANGUAGE_LABELS[terminology.language]}
              </Text>
            </Stack>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <TableSettingsModal opened={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
