/**
 * Surfaces rule provenance inline (spec §8).
 *
 * A caveat siloed in an appendix is a caveat nobody reads mid-hand, so
 * confidence and conflicts appear right next to the rule they apply to. The
 * default state is collapsed to a single badge — progressive disclosure, per
 * the §1 positioning constraint — and expands to the note and its sources.
 */
import { useState } from 'react'
import { Anchor, Badge, Collapse, Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core'

import type { Confidence, Sourced } from '../../core'

const LABELS: Record<Confidence, { label: string; colour: string; meaning: string }> = {
  established: {
    label: 'Agreed',
    colour: 'jade',
    meaning: 'Every source we checked says the same thing.',
  },
  varies: {
    label: 'Varies',
    colour: 'yellow',
    meaning: 'Genuinely differs by region or house rule. We show a common default — check with your table.',
  },
  unverified: {
    label: 'Unverified',
    colour: 'orange',
    meaning: 'We could not corroborate this across sources. Confirm before relying on it.',
  },
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const meta = LABELS[confidence]
  return (
    <Badge color={meta.colour} variant="light" size="sm" radius="sm">
      {meta.label}
    </Badge>
  )
}

export function SourceNote({ sourcing, compact = false }: { sourcing: Sourced; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const meta = LABELS[sourcing.confidence]

  // Nothing worth expanding: a bare "Agreed" badge says all there is to say.
  if (sourcing.confidence === 'established' && !sourcing.note && compact) {
    return <ConfidenceBadge confidence={sourcing.confidence} />
  }

  return (
    <Stack gap={6}>
      <UnstyledButton onClick={() => setOpen((value) => !value)} style={{ width: 'fit-content' }}>
        <Group gap={8} wrap="nowrap">
          <ConfidenceBadge confidence={sourcing.confidence} />
          <Text size="xs" c="dimmed">
            {open ? 'Hide sources' : 'Why?'}
          </Text>
        </Group>
      </UnstyledButton>

      <Collapse expanded={open}>
        <Paper p="sm" radius="sm" bg="dark.6" withBorder>
          <Stack gap={8}>
            <Text size="xs" c="dimmed">
              {meta.meaning}
            </Text>
            {sourcing.note && <Text size="sm">{sourcing.note}</Text>}
            <Stack gap={2}>
              {sourcing.sources.map((source) =>
                source.startsWith('http') ? (
                  <Anchor key={source} href={source} target="_blank" rel="noreferrer" size="xs" lineClamp={1}>
                    {source}
                  </Anchor>
                ) : (
                  // Offline provenance, e.g. a rule sheet supplied by the owner.
                  <Text key={source} size="xs" c="jade.4">
                    {source}
                  </Text>
                ),
              )}
            </Stack>
          </Stack>
        </Paper>
      </Collapse>
    </Stack>
  )
}

/**
 * A standing warning for sections whose content the owner still has to verify.
 * Collapsed to one line by default — on a landscape phone a four-line banner
 * costs a quarter of the screen, and the detail is only needed once per table.
 */
export function VerifyBanner({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Paper
      p="xs"
      radius="md"
      withBorder
      bg="dark.6"
      style={{ borderColor: 'var(--mantine-color-yellow-9)' }}
    >
      <UnstyledButton onClick={() => setOpen((value) => !value)} w="100%">
        <Group gap={8} wrap="nowrap" justify="space-between">
          <Group gap={8} wrap="nowrap">
            <Badge color="yellow" variant="light" size="sm" radius="sm">
              Check first
            </Badge>
            <Text size="sm" lineClamp={1}>
              {summary}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {open ? 'Hide' : 'More'}
          </Text>
        </Group>
      </UnstyledButton>
      <Collapse expanded={open}>
        <Text size="sm" mt="xs">
          {children}
        </Text>
      </Collapse>
    </Paper>
  )
}
