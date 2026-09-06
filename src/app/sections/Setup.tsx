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
  Button,
  Card,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'

import {
  DEAL_SHAPE,
  DEAL_SHAPE_SOURCING,
  SEATING_SEQUENCE,
  describeDeal,
  seatWindForPlayer,
  WALL_SEQUENCE,
  type SetupStep,
} from '../../core'
import { MY_SEAT, RULESET_LABELS, useSettings } from '../settings'
import { SourceNote } from '../components/SourceNote'
import { WIND_LETTER } from '../components/RoundTracker'

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

      <TableSeating />

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

/**
 * Who is at the table, and who deals first.
 *
 * You are always drawn at the bottom, so nobody has to work out which side of
 * a compass diagram they are on. The three other chairs are named by where they
 * sit relative to you, which is how anyone actually refers to them mid-hand
 * ("pass it to your right"), and the seats never move for the whole game — the
 * wind labels are what rotate as the deal passes.
 */
function TableSeating() {
  const { playerNames, setPlayerName, round, setRound, t } = useSettings()

  const seats = [
    { seat: 0, label: 'You', hint: 'bottom of the table' },
    { seat: 1, label: 'Your right', hint: 'plays after you' },
    { seat: 2, label: 'Across', hint: 'opposite you' },
    { seat: 3, label: 'Your left', hint: 'plays before you' },
  ]

  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={5}>Who is playing</Title>
          <Badge variant="light" color="gray" radius="sm">
            One time
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" lh={1.4}>
          Name the table once. Seats never move for the whole game — it is the wind
          labels that rotate as the deal passes.
        </Text>

        <Grid gap="xs">
          {seats.map(({ seat, label, hint }) => {
            const isDealer = seat === round.dealerSeat
            return (
              <Grid.Col key={seat} span={{ base: 12, sm: 6, md: 3 }}>
                <Paper
                  p="xs"
                  radius="sm"
                  bg={seat === MY_SEAT ? 'dark.5' : 'dark.6'}
                  h="100%"
                  style={
                    seat === MY_SEAT
                      ? { border: '1px solid var(--mantine-color-jade-6)' }
                      : undefined
                  }
                >
                  <Stack gap={6}>
                    <Group justify="space-between" gap={4} wrap="nowrap">
                      <Text size="10px" c="dimmed" tt="uppercase" fw={700} lh={1.3}>
                        {label}
                      </Text>
                      <Text size="10px" c="jade.4" fw={700} lh={1.3}>
                        {WIND_LETTER[seatWindForPlayer(seat, round.dealerSeat)]}
                        {isDealer ? ` · ${t('dealer')}` : ''}
                      </Text>
                    </Group>
                    <TextInput
                      size="xs"
                      value={playerNames[seat]}
                      onChange={(event) => setPlayerName(seat, event.currentTarget.value)}
                      aria-label={`Name of the player ${label.toLowerCase()}`}
                    />
                    <Text size="10px" c="dimmed" lh={1.3}>
                      {hint}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            )
          })}
        </Grid>

        <Stack gap={6}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Who starts as East?
          </Text>
          <Group gap={6} wrap="wrap">
            {seats.map(({ seat, label }) => (
              <Button
                key={seat}
                size="xs"
                variant={seat === round.dealerSeat ? 'filled' : 'light'}
                color={seat === round.dealerSeat ? 'jade' : 'gray'}
                onClick={() =>
                  setRound({
                    ...round,
                    dealerSeat: seat,
                    // The round wraps back to whoever starts it, so this has to
                    // move with the dealer or the East round ends early.
                    roundStartSeat: seat,
                    roundWind: 'east',
                    dealerStreak: 0,
                    handNumber: 1,
                  })
                }
              >
                {playerNames[seat] || label}
              </Button>
            ))}
          </Group>
          <Text size="10px" c="dimmed" lh={1.4}>
            East deals the first hand and holds the deal while they keep winning. Setting
            this restarts the count at hand 1.
          </Text>
        </Stack>
      </Stack>
    </Card>
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
