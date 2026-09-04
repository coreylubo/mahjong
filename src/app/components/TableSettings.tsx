/**
 * Table settings — ruleset and terminology, behind a gear (spec §5).
 *
 * These are decisions a table makes ONCE, before the first hand, and then
 * lives with. Keeping them in a permanent title bar spent 48px of vertical on
 * controls nobody touches mid-game — expensive in landscape on a phone, which
 * is the orientation this app is built for.
 *
 * WHY A CENTRED MODAL RATHER THAN A BOTTOM SHEET.
 * A bottom sheet is the usual mobile answer and is the wrong one here. In
 * landscape a phone is about 390px tall, so a sheet rising from the bottom
 * gets a couple of hundred pixels to hold two grouped choices — it would
 * scroll immediately. A centred modal spends the axis landscape actually has,
 * which is width. It is also honest about the interaction: this is a
 * deliberate setup step, not a quick flick.
 *
 * WHY THE RULESET STILL SHOWS ON THE BUTTON.
 * Hiding a setting is fine; hiding which setting is active is not. Hong Kong
 * and Taiwanese disagree about what a hand is worth, so a player reading the
 * wrong ruleset is reading wrong money. The trigger always names the ruleset
 * in force, so it stays glanceable even though the control is put away.
 */
import { useState } from 'react'
import {
  Badge,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import type { Ruleset, TermLanguage } from '../../core'
import { DEAL_SHAPE } from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'

const LANGUAGE_LABELS: Record<TermLanguage, string> = {
  en: 'English',
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
}

/** No icon package in this project, so the gear is drawn inline. */
function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function TableSettings() {
  const [open, setOpen] = useState(false)
  const { ruleset, setRuleset, terminology, setTerminology } = useSettings()

  return (
    <>
      <UnstyledButton
        className="section-tab settings-tab"
        onClick={() => setOpen(true)}
        px="sm"
        py={8}
        aria-label={`Table settings. Ruleset: ${RULESET_LABELS[ruleset]}.`}
      >
        <Text size="sm" fw={600} c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GearIcon />
          Settings
        </Text>
        {/* The active ruleset stays visible even though its control is put away. */}
        <Text size="10px" c="jade.4" fw={700} lh={1.25}>
          {RULESET_LABELS[ruleset]}
        </Text>
      </UnstyledButton>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Table settings"
        size="lg"
        centered
        radius="md"
        overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed" lh={1.45}>
            Agree these once, before the first hand. They change what every screen shows —
            including what a hand is worth.
          </Text>

          <Stack gap={6}>
            <Text size="sm" fw={700}>
              Ruleset
            </Text>
            <SegmentedControl
              fullWidth
              value={ruleset}
              onChange={(value) => setRuleset(value as Ruleset)}
              data={(['hongKong', 'taiwanese'] as const).map((id) => ({
                value: id,
                label: RULESET_LABELS[id],
              }))}
            />
            <Text size="xs" c="dimmed" lh={1.4}>
              {RULESET_LABELS[ruleset]} deals a {DEAL_SHAPE[ruleset].handSize}-tile hand —{' '}
              {DEAL_SHAPE[ruleset].setsPlusPair}. Scores are counted in{' '}
              {ruleset === 'hongKong' ? 'faan' : 'tai'}.
            </Text>
          </Stack>

          <Stack gap={6}>
            <Text size="sm" fw={700}>
              Game terms
            </Text>
            <SegmentedControl
              fullWidth
              value={terminology.language}
              onChange={(value) =>
                setTerminology({ ...terminology, language: value as TermLanguage })
              }
              data={(['en', 'cantonese', 'mandarin'] as const).map((language) => ({
                value: language,
                label: LANGUAGE_LABELS[language],
              }))}
            />

            {terminology.language === 'en' ? (
              <Text size="xs" c="dimmed" lh={1.4}>
                Terms show their English names — pung, kong, chow.
              </Text>
            ) : (
              <Stack gap={6} mt={4}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lh={1.3}>
                  Written as
                </Text>
                <SegmentedControl
                  fullWidth
                  value={terminology.script}
                  onChange={(value) =>
                    setTerminology({
                      ...terminology,
                      script: value as 'romanized' | 'characters',
                    })
                  }
                  data={[
                    { value: 'romanized', label: 'Romanized (pung, gong)' },
                    { value: 'characters', label: 'Characters (碰, 槓)' },
                  ]}
                />
                <Text size="xs" c="dimmed" lh={1.4}>
                  English names stay alongside, so nobody is stuck on a term they do not
                  know yet.
                </Text>
              </Stack>
            )}
          </Stack>

          <Badge variant="light" color="gray" radius="sm" style={{ alignSelf: 'flex-start' }}>
            Changes apply immediately
          </Badge>
        </Stack>
      </Modal>
    </>
  )
}
