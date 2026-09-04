/**
 * Scoring Reference (spec §4.4).
 *
 * Browsable tables per ruleset, plus payout rules. The ruleset toggle shifts
 * the values and the differences surface inline (spec §3) rather than being
 * siloed into a separate comparison page.
 *
 * Everything on this screen is rule content, so everything carries its
 * provenance — see the standing note at the top (spec §8).
 */
import { useMemo, useState } from 'react'
import { Badge, Card, Chip, Grid, Group, Paper, Stack, Table, Text, Title } from '@mantine/core'

import {
  PAYOUT_DIFFERENCES,
  SCORING_BY_RULESET,
  HK_POINTS_TABLE,
  FAAN_CONVERSION_SOURCING,
  HK_PAYMENT_SOURCING,
  TW_PAYMENT_SOURCING,
  faanToPoints,
  taiToAmount,
  type PatternCategory,
} from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'
import { ConfidenceBadge, SourceNote, VerifyBanner } from '../components/SourceNote'

const CATEGORIES: { value: PatternCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hand', label: 'Hand shapes' },
  { value: 'meld', label: 'Melds' },
  { value: 'situational', label: 'How you won' },
  { value: 'bonus', label: 'Flowers' },
  { value: 'limit', label: 'Limit hands' },
]

export function ScoringReferenceSection() {
  const { ruleset, t, terminology } = useSettings()
  const [category, setCategory] = useState<PatternCategory | 'all'>('all')
  const scoring = SCORING_BY_RULESET[ruleset]
  const unit = t(scoring.unitTermKey)

  const patterns = useMemo(
    () =>
      [...scoring.patterns]
        .filter((pattern) => category === 'all' || pattern.category === category)
        .sort((a, b) => a.value - b.value),
    [scoring, category],
  )

  const showChinese = terminology.language !== 'en'

  /** Resolve a `replaces` id to the parent hand's name for display. */
  const replacedName = (id: string) =>
    scoring.patterns.find((pattern) => pattern.id === id)?.name ?? id

  return (
    <Stack gap="md">
      <VerifyBanner summary="Scoring values differ between tables — agree them before the first hand.">
        Mahjong has no governing body, so values differ between regions, clubs and households. Anything
        marked <b>Varies</b> or <b>Unverified</b> should be agreed with the people you are playing with
        before you start. Tap <b>Why?</b> on any row to see the sources it was drawn from.
      </VerifyBanner>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Stack gap="sm">
            <Group justify="space-between" align="flex-end">
              <Title order={4}>{RULESET_LABELS[ruleset]} scoring</Title>
              <Text size="xs" c="dimmed">
                Values in {unit}
              </Text>
            </Group>

            <Chip.Group
              multiple={false}
              value={category}
              onChange={(value) => setCategory(value as PatternCategory | 'all')}
            >
              <Group gap={6}>
                {CATEGORIES.map((option) => (
                  <Chip key={option.value} value={option.value} size="sm" radius="sm" variant="light">
                    {option.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>

            <Card withBorder radius="md" bg="dark.7" p={0}>
              <Table verticalSpacing="sm" horizontalSpacing="md" striped stripedColor="dark.6">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 72 }}>{unit}</Table.Th>
                    <Table.Th>Hand</Table.Th>
                    <Table.Th style={{ width: 128 }}>Source</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {patterns.map((pattern) => (
                    <Table.Tr key={pattern.id}>
                      <Table.Td valign="top">
                        <Group gap={4} wrap="nowrap">
                          <Text fz={22} fw={700} lh={1.1}>
                            {pattern.value}
                          </Text>
                          {pattern.repeatable && (
                            <Text size="10px" c="dimmed" lh={1.1}>
                              each
                            </Text>
                          )}
                        </Group>
                        {pattern.isLimit && (
                          <Badge size="xs" color="yellow" variant="light" radius="sm">
                            limit
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td valign="top">
                        <Stack gap={2}>
                          <Group gap={8} align="baseline">
                            <Text fw={600}>{pattern.name}</Text>
                            {showChinese && pattern.chinese && (
                              <Text size="sm" c="jade.3">
                                {terminology.script === 'characters'
                                  ? pattern.chinese
                                  : (pattern.romanized ?? pattern.chinese)}
                              </Text>
                            )}
                          </Group>
                          <Text size="xs" c="dimmed" lh={1.45}>
                            {pattern.description}
                          </Text>
                          {pattern.replaces && (
                            <Text size="xs" c="yellow.5" lh={1.45}>
                              Replaces {replacedName(pattern.replaces)} — count this instead, not both.
                            </Text>
                          )}
                          {pattern.beginnerNote && (
                            <Text size="xs" c="jade.4" lh={1.45}>
                              {pattern.beginnerNote}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td valign="top">
                        <SourceNote sourcing={pattern.sourcing} compact />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Stack gap="md">
            <Card withBorder radius="md" bg="dark.7" p="md">
              <Stack gap="sm">
                <Title order={5}>Table settings</Title>
                <Paper p="sm" radius="sm" bg="dark.6">
                  <Group justify="space-between">
                    <Text size="sm">Minimum to declare a win</Text>
                    <Badge variant="light" radius="sm">
                      {scoring.minimum.common} {unit}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Commonly {scoring.minimum.range}
                  </Text>
                  <SourceNote sourcing={scoring.minimum.sourcing} />
                </Paper>
                <Paper p="sm" radius="sm" bg="dark.6">
                  <Group justify="space-between">
                    <Text size="sm">Payout ceiling</Text>
                    <Badge variant="light" radius="sm">
                      {scoring.limit.common} {unit}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Commonly {scoring.limit.range}
                  </Text>
                  <SourceNote sourcing={scoring.limit.sourcing} />
                </Paper>
              </Stack>
            </Card>

            <PayoutCard />

            <Card withBorder radius="md" bg="dark.7" p="md">
              <Stack gap="sm">
                <Title order={5}>Hong Kong vs Taiwanese</Title>
                {PAYOUT_DIFFERENCES.map((difference) => (
                  <Paper key={difference.topic} p="sm" radius="sm" bg="dark.6">
                    <Group justify="space-between" gap={6} wrap="nowrap" mb={4}>
                      <Text size="sm" fw={700}>
                        {difference.topic}
                      </Text>
                      <ConfidenceBadge confidence={difference.sourcing.confidence} />
                    </Group>
                    <Text size="sm" lh={1.4}>
                      <Text span c="jade.4" fw={600}>
                        HK:{' '}
                      </Text>
                      {difference.hongKong}
                    </Text>
                    <Text size="sm" lh={1.4} mt={2}>
                      <Text span c="jade.4" fw={600}>
                        TW:{' '}
                      </Text>
                      {difference.taiwanese}
                    </Text>
                    {difference.sourcing.note && (
                      <Text size="xs" c="yellow.4" mt={4} lh={1.4}>
                        {difference.sourcing.note}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

/** The "what does that actually cost me" panel. */
function PayoutCard() {
  const { ruleset, t } = useSettings()
  const isHK = ruleset === 'hongKong'
  const unit = t(isHK ? 'faan' : 'tai')
  const rows = isHK ? HK_POINTS_TABLE.map((_, faan) => faan) : [0, 1, 2, 3, 4, 5, 8, 16]

  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm">
        <Title order={5}>What it pays</Title>
        <Text size="xs" c="dimmed">
          {isHK
            ? 'The published chart from your rule sheet. Not a plain doubling — it tapers above 4 faan.'
            : 'Base stake plus a fixed amount per tai. Shown for a base of 3 and 2 per tai.'}
        </Text>

        <Table verticalSpacing={6} horizontalSpacing="sm" withColumnBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{unit}</Table.Th>
              <Table.Th>{isHK ? 'Points' : 'Each payer'}</Table.Th>
              <Table.Th>{isHK ? 'Discarder pays' : 'Self-draw total'}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((value) => {
              const each = isHK ? faanToPoints(value) : taiToAmount(value)
              return (
                <Table.Tr key={value}>
                  <Table.Td fw={600}>{value}</Table.Td>
                  <Table.Td>{each}</Table.Td>
                  <Table.Td c="dimmed">{isHK ? each * 2 : each * 3}</Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>

        <Paper p="sm" radius="sm" bg="dark.6">
          <Text size="sm" fw={600} mb={2}>
            Who pays
          </Text>
          <Text size="sm" lh={1.4}>
            <b>Off a discard:</b> {isHK ? 'the discarder alone pays, at double the points' : 'the discarder alone pays the full amount'}. The other two pay nothing.
          </Text>
          <Text size="sm" lh={1.4} mt={4}>
            <b>Self-draw:</b> all three opponents pay the face-value points — and the self-draw itself is
            worth an extra {unit}.
          </Text>
        </Paper>

        <SourceNote sourcing={isHK ? HK_PAYMENT_SOURCING : TW_PAYMENT_SOURCING} />
        {isHK && <SourceNote sourcing={FAAN_CONVERSION_SOURCING} />}
      </Stack>
    </Card>
  )
}
