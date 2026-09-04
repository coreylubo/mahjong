/**
 * Table settings — ruleset and terminology (spec §5).
 *
 * These are decisions a table makes ONCE, before the first hand, and then
 * lives with. They used to sit in a permanent title bar, which spent 48px of
 * vertical on controls nobody touches mid-game — expensive in landscape on a
 * phone, the orientation this app is built for. They now open from the
 * floating nav.
 *
 * WHY A CENTRED MODAL RATHER THAN A BOTTOM SHEET.
 * A bottom sheet is the usual mobile answer and is the wrong one here. In
 * landscape a phone is about 390px tall, so a sheet rising from the bottom
 * gets a couple of hundred pixels to hold two grouped choices — it would
 * scroll immediately. A centred modal spends the axis landscape actually has,
 * which is width. It is also honest about the interaction: this is a
 * deliberate setup step, not a quick flick.
 *
 * WHERE THE ACTIVE RULESET STAYS VISIBLE.
 * Hiding a setting is fine; hiding which setting is in force is not, since
 * Hong Kong and Taiwanese disagree about what a hand is worth and a player
 * reading the wrong one is reading wrong money. The nav names it on the
 * settings entry, and the two screens where it changes the numbers — Scoring
 * and Setup — both title themselves with it.
 */
import {
  Badge,
  Modal,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core'

import type { Ruleset, TermLanguage } from '../../core'
import { DEAL_SHAPE } from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'

export const LANGUAGE_LABELS: Record<TermLanguage, string> = {
  en: 'English',
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
}

export function TableSettingsModal({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const { ruleset, setRuleset, terminology, setTerminology } = useSettings()

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
  )
}
