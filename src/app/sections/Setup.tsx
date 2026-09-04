/**
 * Setup (spec §4.1): everything that happens before the first discard.
 *
 * Split into the two moments that actually feel different at a table:
 *
 *  - "Once, before you start" — settling seats and the first dealer. Done one
 *    time per game and then forgotten, which is exactly why beginners redo it
 *    every hand.
 *  - "Every hand" — rebuild, roll, break, deal. Done again and again, so it is
 *    the half that needs to be glanceable, and it sits first on the widest
 *    column.
 *
 * The hand-size card sits at the top of the page because it is the single
 * number someone reaches for mid-deal, and it is the one thing that genuinely
 * differs between the two rulesets.
 */
import {
  Badge,
  Card,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import {
  DEAL_SHAPE,
  DEAL_SHAPE_SOURCING,
  SEATING_SEQUENCE,
  describeDeal,
  WALL_SEQUENCE,
  type SetupStep,
} from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'
import { SourceNote } from '../components/SourceNote'

export function SetupSection() {
  const { ruleset, groupWord } = useSettings()
  const shape = DEAL_SHAPE[ruleset]

  return (
    <Stack gap="md">
      <Card withBorder radius="md" bg="dark.7" p="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={5}>The deal, at a glance</Title>
            <Badge variant="light" color="jade" radius="sm">
              {RULESET_LABELS[ruleset]}
            </Badge>
          </Group>

          <Grid gap="xs">
            <DealFact label="Your hand" value={`${shape.handSize} tiles`} />
            <DealFact label="Dealer starts on" value={`${shape.dealerHandSize} tiles`} />
            <DealFact
              label="You are building"
              value={`${shape.setCount} ${groupWord(true)} + a pair`}
            />
            <DealFact label="Each wall" value={`${shape.stacksPerWall} stacks of 2`} />
            <DealFact label="Dealt as" value={describeDeal(ruleset)} />
            <DealFact label="Dead wall" value={`${shape.deadWallStacks} stacks`} />
          </Grid>

          <Text size="xs" c="dimmed" lh={1.4}>
            The dealer is always one tile ahead of everyone else and opens the hand by
            discarding, which brings them level.
          </Text>

          <SourceNote sourcing={DEAL_SHAPE_SOURCING} />
        </Stack>
      </Card>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" bg="dark.7" p="md" h="100%">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Title order={5}>Every hand</Title>
                <Badge variant="light" color="jade" radius="sm">
                  Repeat each deal
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" lh={1.4}>
                The wall comes down and gets rebuilt from scratch every single hand.
              </Text>
              {WALL_SEQUENCE.map((step, index) => (
                <SetupStepCard key={step.id} step={step} index={index} filled />
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" bg="dark.7" p="md" h="100%">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Title order={5}>Once, before you start</Title>
                <Badge variant="light" color="gray" radius="sm">
                  One time
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" lh={1.4}>
                Seats and the first dealer are settled once and then left alone. You do
                not redraw for seats between hands — the deal simply passes.
              </Text>
              {SEATING_SEQUENCE.map((step, index) => (
                <SetupStepCard key={step.id} step={step} index={index} />
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

function DealFact({ label, value }: { label: string; value: string }) {
  return (
    <Grid.Col span={{ base: 6, sm: 4 }}>
      <Paper p="xs" radius="sm" bg="dark.6" h="100%">
        <Text size="10px" c="dimmed" tt="uppercase" fw={700} lh={1.3}>
          {label}
        </Text>
        <Text size="sm" fw={600} lh={1.3}>
          {value}
        </Text>
      </Paper>
    </Grid.Col>
  )
}

/**
 * One numbered step. `perRuleset` detail replaces the shared detail rather than
 * appending to it, so the reader never has to work out which of two paragraphs
 * applies to their table.
 */
function SetupStepCard({
  step,
  index,
  filled = false,
}: {
  step: SetupStep
  index: number
  filled?: boolean
}) {
  const { ruleset } = useSettings()
  const specific = step.perRuleset?.[ruleset]

  return (
    <Paper p="sm" radius="sm" bg="dark.6">
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <Badge circle variant={filled ? 'filled' : 'light'} size="lg">
          {index + 1}
        </Badge>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600}>
            {step.title}
          </Text>
          <Text size="sm" c="dimmed" lh={1.4}>
            {step.detail}
          </Text>

          {specific && (
            <Paper p={8} radius="sm" bg="dark.7">
              <Text size="10px" c="jade.4" tt="uppercase" fw={700} lh={1.3} mb={2}>
                {RULESET_LABELS[ruleset]}
              </Text>
              <Text size="sm" lh={1.4}>
                {specific}
              </Text>
            </Paper>
          )}

          {step.beginnerNote && (
            <Text size="xs" c="jade.4" lh={1.4}>
              {step.beginnerNote}
            </Text>
          )}

          <SourceNote sourcing={step.sourcing} />
        </Stack>
      </Group>
    </Paper>
  )
}
