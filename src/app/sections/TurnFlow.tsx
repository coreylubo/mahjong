/**
 * Turn Flow (spec §4.1): whose turn it is, which way play runs, and live
 * round/seat wind trackers.
 *
 * Setting up — seats, wall, dice, dealing — lives in the Setup section.
 *
 * The trackers are the part used mid-game, so they sit at the top and take one
 * tap to advance. The procedural content sits underneath for when someone
 * needs it.
 */
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import {
  GAME_LENGTH,
  INITIAL_ROUND,
  OFF_TURN_ACTIONS,
  ROUND_SOURCING,
  TURN_SEQUENCE,
  advanceRound,
  seatWindForPlayer,
  type RoundState,
} from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'
import { SourceNote } from '../components/SourceNote'

const SEAT_NAMES = ['Seat 1', 'Seat 2', 'Seat 3', 'Seat 4']
const WIND_CHAR: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' }

export function TurnFlowSection() {
  const [round, setRound] = useState<RoundState>(INITIAL_ROUND)
  const { ruleset, t } = useSettings()

  return (
    <Stack gap="md">
      <Grid gap="md">
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Card withBorder radius="md" bg="dark.7" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Title order={5}>Round tracker</Title>
                <Badge variant="light" radius="sm">
                  Hand {round.handNumber}
                </Badge>
              </Group>

              <Group gap="lg">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Round wind
                  </Text>
                  <Group gap={8} align="baseline">
                    <Text fz={34} fw={700} lh={1}>
                      {WIND_CHAR[round.roundWind]}
                    </Text>
                    <Text size="sm" tt="capitalize">
                      {t(round.roundWind)}
                    </Text>
                  </Group>
                </Stack>

                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {t('dealer')}
                  </Text>
                  <Text fz={20} fw={600} lh={1.4}>
                    {SEAT_NAMES[round.dealerSeat]}
                  </Text>
                  {round.dealerStreak > 0 && (
                    <Badge size="sm" color="yellow" variant="light" radius="sm">
                      {round.dealerStreak} in a row
                    </Badge>
                  )}
                </Stack>
              </Group>

              <SimpleGrid cols={4} spacing={6}>
                {SEAT_NAMES.map((name, seat) => {
                  const wind = seatWindForPlayer(seat, round.dealerSeat)
                  return (
                    <Paper
                      key={name}
                      p={8}
                      radius="sm"
                      bg={seat === round.dealerSeat ? 'jade.9' : 'dark.6'}
                      ta="center"
                    >
                      <Text fz={20} fw={700} lh={1.2}>
                        {WIND_CHAR[wind]}
                      </Text>
                      <Text size="10px" c="dimmed" lh={1.2}>
                        {name}
                      </Text>
                    </Paper>
                  )
                })}
              </SimpleGrid>

              <Stack gap={6}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Hand finished — who won?
                </Text>
                <Group gap={6} grow>
                  <Button
                    onClick={() => setRound(advanceRound(round, { type: 'win', winnerSeat: round.dealerSeat }))}
                  >
                    {t('dealer')}
                  </Button>
                  <Button
                    variant="light"
                    onClick={() =>
                      setRound(advanceRound(round, { type: 'win', winnerSeat: (round.dealerSeat + 1) % 4 }))
                    }
                  >
                    Someone else
                  </Button>
                </Group>
                <Group gap={6} grow>
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => setRound(advanceRound(round, { type: 'draw' }))}
                  >
                    Washout
                  </Button>
                  <Button variant="subtle" color="gray" onClick={() => setRound(INITIAL_ROUND)}>
                    Reset
                  </Button>
                </Group>
              </Stack>

              <Text size="xs" c="dimmed">
                {RULESET_LABELS[ruleset]}: {GAME_LENGTH[ruleset].label}. {GAME_LENGTH[ruleset].detail}
              </Text>
              <SourceNote sourcing={ROUND_SOURCING} />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 7 }}>
          <Card withBorder radius="md" bg="dark.7" p="md" h="100%">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Title order={5}>Your turn, in order</Title>
                <Badge variant="light" color="jade" radius="sm">
                  Play runs counter-clockwise
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                Tiles pass to the player on your <b>right</b>. That feels clockwise from above — it is not.
              </Text>

              {TURN_SEQUENCE.map((step, index) => (
                <Paper key={step.id} p="sm" radius="sm" bg="dark.6">
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Badge circle variant="filled" size="lg">
                      {index + 1}
                    </Badge>
                    <Stack gap={2}>
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
        </Grid.Col>
      </Grid>

      <Grid gap="md">
        <Grid.Col span={12}>
          <Card withBorder radius="md" bg="dark.7" p="md" h="100%">
            <Stack gap="sm">
              <Title order={5}>While you wait for your turn</Title>
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
        </Grid.Col>

      </Grid>
    </Stack>
  )
}
