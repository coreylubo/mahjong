/**
 * Turns (spec §4.1): what you do on your go, and what you may do on everyone
 * else's.
 *
 * This section used to carry three unrelated things: the round tracker, the
 * turn order, and how to build the wall. They have been pulled apart, because
 * they are consulted at different moments — the wall is a Setup concern, the
 * round tracker is needed from every screen and now floats, and what is left
 * here is the turn loop itself.
 *
 * WHY TWO TABS RATHER THAN TWO CARDS.
 * At any given moment exactly one of these applies to you: it is your turn or
 * it is not. Showing both at once asks the reader to work out which half to
 * read, mid-hand, which is the moment they have least attention to spare. The
 * tabs also make the off-turn actions a first-class half rather than a
 * footnote — claiming a discard is where beginners lose the most value.
 */
import { useState } from 'react'
import {
  Alert,
  Badge,
  Card,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { OFF_TURN_ACTIONS, TURN_SEQUENCE } from '../../core'

type Side = 'mine' | 'theirs'

export function TurnsSection() {
  const [side, setSide] = useState<Side>('mine')

  return (
    <Stack gap="md">
      <SegmentedControl
        fullWidth
        size="md"
        value={side}
        onChange={(value) => setSide(value as Side)}
        data={[
          { value: 'mine', label: 'My turn' },
          { value: 'theirs', label: "Someone else's turn" },
        ]}
      />

      <Alert variant="light" color="jade" radius="md" p="sm">
        <Text size="sm" lh={1.4}>
          Play runs <b>counter-clockwise</b> — tiles pass to the player on your{' '}
          <b>right</b>. Seen from above that looks clockwise. It is not.
        </Text>
      </Alert>

      {side === 'mine' ? <MyTurn /> : <TheirTurn />}
    </Stack>
  )
}

function MyTurn() {
  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={5}>Your turn, in order</Title>
          <Badge variant="light" color="jade" radius="sm">
            Every time
          </Badge>
        </Group>

        {TURN_SEQUENCE.map((step, index) => (
          <Paper key={step.id} p="sm" radius="sm" bg="dark.6">
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Badge circle variant="filled" size="lg">
                {index + 1}
              </Badge>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600}>
                  {step.title}
                </Text>
                <Text size="sm" c="dimmed" lh={1.4}>
                  {step.detail}
                </Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Card>
  )
}

function TheirTurn() {
  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={5}>What you may claim</Title>
          <Badge variant="light" color="gray" radius="sm">
            Speak up before the next draw
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" lh={1.4}>
          A discard is only claimable for a moment. Once the next player has drawn, it is
          gone.
        </Text>

        {OFF_TURN_ACTIONS.map((action) => (
          <Paper key={action.id} p="sm" radius="sm" bg="dark.6">
            <Text size="sm" fw={600}>
              {action.title}
            </Text>
            <Text size="sm" c="dimmed" lh={1.4}>
              {action.detail}
            </Text>
          </Paper>
        ))}
      </Stack>
    </Card>
  )
}
