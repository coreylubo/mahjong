/**
 * Scorekeeper (spec §4.6). Local state only — V1 accepts losing it on refresh.
 *
 * The UI is a thin shell over the pure reducer in src/core/scorekeeper.ts. All
 * the arithmetic, and the payout convention behind it, lives in core; this file
 * only collects taps and renders results.
 */
import { useReducer, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Box,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'

import {
  SCORING_BY_RULESET,
  createScorekeeper,
  scorekeeperReducer,
  standings,
  totals,
  seatWindForPlayer,
} from '../../core'
import { MY_SEAT, useSettings } from '../settings'
import { WIND_CHAR, WIND_LETTER } from '../components/RoundTracker'

/** Same relative layout as the round tracker's diagram: you at the bottom. */
const SEAT_SLOTS = [
  { offset: 0, area: 'me', label: 'You' },
  { offset: 1, area: 'right', label: 'Your right' },
  { offset: 2, area: 'across', label: 'Across' },
  { offset: 3, area: 'left', label: 'Your left' },
] as const

export function ScorekeeperSection() {
  const { ruleset, t, hkPaymentStyle, playerNames, round } = useSettings()
  const [state, dispatch] = useReducer(scorekeeperReducer, undefined, () => createScorekeeper())
  const [winnerSeat, setWinnerSeat] = useState(0)
  const [discarderSeat, setDiscarderSeat] = useState<number | 'self'>('self')
  // Only the Hong Kong Classical system prices the dealer differently, so the
  // control only appears when it would actually change the numbers.
  const [dealerSeat, setDealerSeat] = useState(0)
  const needsDealer = ruleset === 'hongKong' && hkPaymentStyle === 'classical'
  const [score, setScore] = useState<number>(SCORING_BY_RULESET[ruleset].minimum.common)

  const unit = t(SCORING_BY_RULESET[ruleset].unitTermKey)
  const running = totals(state)
  const ranked = standings(state)

  function record() {
    dispatch({
      type: 'recordWin',
      id: `${Date.now()}`,
      input: {
        ruleset,
        winnerSeat,
        discarderSeat: discarderSeat === 'self' ? undefined : discarderSeat,
        dealerSeat: needsDealer ? dealerSeat : undefined,
        score,
        hkRules: { minimumFaan: 0, limitFaan: 13, paymentStyle: hkPaymentStyle },
      },
    })
  }

  // Names come from the shared table state, so the winner picker says the same
  // thing as the seating diagram and the round tracker.
  const seatOptions = state.players.map((player) => ({
    value: String(player.seat),
    label: playerNames[player.seat] ?? player.name,
  }))

  return (
    <Grid gap="md">
      <Grid.Col span={{ base: 12, sm: 5 }}>
        <Card withBorder radius="md" bg="dark.7" p="md">
          <Stack gap="sm">
            <Title order={5}>Record a hand</Title>

            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Winner
              </Text>
              <SegmentedControl
                fullWidth
                value={String(winnerSeat)}
                onChange={(value) => {
                  const seat = Number(value)
                  setWinnerSeat(seat)
                  // The new winner disappears from the "Won on" options, so a
                  // stale selection would silently record them as their own
                  // discarder. Fall back to a self-draw.
                  if (discarderSeat === seat) setDiscarderSeat('self')
                }}
                data={seatOptions}
              />
            </Stack>

            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Won on
              </Text>
              <SegmentedControl
                fullWidth
                value={discarderSeat === 'self' ? 'self' : String(discarderSeat)}
                onChange={(value) => setDiscarderSeat(value === 'self' ? 'self' : Number(value))}
                data={[
                  { value: 'self', label: t('selfDraw') },
                  ...seatOptions.filter((option) => Number(option.value) !== winnerSeat),
                ]}
              />
              <Text size="xs" c="dimmed">
                {needsDealer
                  ? 'Classical: everyone pays, and the doublings stack.'
                  : discarderSeat === 'self'
                    ? 'All three opponents pay.'
                    : 'Only the player who discarded pays, at double.'}
              </Text>
            </Stack>

            {needsDealer && (
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Dealer
                </Text>
                <SegmentedControl
                  fullWidth
                  value={String(dealerSeat)}
                  onChange={(value) => setDealerSeat(Number(value))}
                  data={seatOptions}
                />
              </Stack>
            )}

            <NumberInput
              label={`${unit} scored`}
              size="md"
              allowDecimal={false}
              allowNegative={false}
              step={1}
              min={0}
              max={ruleset === 'hongKong' ? 13 : 64}
              value={score}
              onChange={(value) => setScore(typeof value === 'number' ? value : 0)}
            />

            <Group grow>
              <Button onClick={record}>Add hand</Button>
              <Button
                variant="light"
                color="gray"
                onClick={() => dispatch({ type: 'recordDraw', id: `${Date.now()}`, ruleset })}
              >
                Washout
              </Button>
            </Group>

            <Group grow>
              <Button
                variant="subtle"
                color="gray"
                disabled={state.hands.length === 0}
                onClick={() => dispatch({ type: 'undo' })}
              >
                Undo last
              </Button>
              <Button
                variant="subtle"
                color="red"
                disabled={state.hands.length === 0}
                onClick={() => dispatch({ type: 'reset' })}
              >
                Clear all
              </Button>
            </Group>

            <Text size="xs" c="dimmed">
              {ruleset === 'hongKong' ? `Hong Kong, ${hkPaymentStyle === 'classical' ? 'Classical' : 'New Style'} payments. ` : ''}
              Scores are held in memory only. Refreshing the page clears them.
            </Text>
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 7 }}>
        <Stack gap="md">
          <Card withBorder radius="md" bg="dark.7" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Title order={5}>Table</Title>
                <Badge variant="light" radius="sm">
                  {state.hands.length} {state.hands.length === 1 ? 'hand' : 'hands'}
                </Badge>
              </Group>

              {/*
                Laid out as the table, not as a row of cards. Scores are read
                while looking at the people they belong to, so "across from me
                is down 40" should not need translating from a grid position.
                Names, seats and the dealer all come from the same table state
                the round tracker uses.
              */}
              <Box className="table-diagram">
                {SEAT_SLOTS.map(({ offset, area, label }) => {
                  const seat = (MY_SEAT + offset) % 4
                  const total = running[seat] ?? 0
                  const leading = ranked[0]?.player.seat === seat && total !== 0
                  const wind = seatWindForPlayer(seat, round.dealerSeat)
                  const isDealer = seat === round.dealerSeat

                  return (
                    <Box
                      key={area}
                      className="table-seat table-seat--score"
                      style={{ gridArea: area }}
                      data-dealer={isDealer || undefined}
                      data-me={offset === 0 || undefined}
                    >
                      <Group gap={4} align="baseline" justify="center">
                        <Text fz={14} fw={700} lh={1.1}>
                          {WIND_CHAR[wind]}
                        </Text>
                        <Text fz={11} fw={700} lh={1.1} c="gray.5">
                          {WIND_LETTER[wind]}
                        </Text>
                        {isDealer && (
                          <Text fz={9} fw={700} c="yellow.4" tt="uppercase" lh={1.1}>
                            {t('dealer')}
                          </Text>
                        )}
                      </Group>
                      <Text fz={12} fw={600} lh={1.25} c={offset === 0 ? 'jade.3' : 'gray.3'}>
                        {playerNames[seat]}
                      </Text>
                      <Text
                        fz={26}
                        fw={700}
                        lh={1.2}
                        c={total > 0 ? 'jade.3' : total < 0 ? 'red.4' : undefined}
                      >
                        {total > 0 ? `+${total}` : total}
                      </Text>
                      <Text fz={8} c="dimmed" lh={1.2}>
                        {playerNames[seat] === label ? '' : label}
                        {leading ? (playerNames[seat] === label ? 'leading' : ' · leading') : ''}
                      </Text>
                    </Box>
                  )
                })}

                <Box className="table-centre">
                  <Text fz={10} c="dimmed" ta="center" lh={1.3}>
                    Hand {round.handNumber}
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Card>

          <Card withBorder radius="md" bg="dark.7" p={state.hands.length ? 0 : 'md'}>
            {state.hands.length === 0 ? (
              <Text size="sm" c="dimmed">
                No hands recorded yet. Add one on the left and the running totals update here.
              </Text>
            ) : (
              <Table verticalSpacing="sm" horizontalSpacing="md" striped stripedColor="dark.6">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 44 }}>#</Table.Th>
                    <Table.Th>What happened</Table.Th>
                    {state.players.map((player) => (
                      <Table.Th key={player.seat} ta="right">
                        {playerNames[player.seat] ?? player.name}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[...state.hands].reverse().map((hand, index) => (
                    <Table.Tr key={hand.id}>
                      <Table.Td c="dimmed">{state.hands.length - index}</Table.Td>
                      <Table.Td>
                        <Text size="sm" lh={1.4}>
                          {hand.explanation}
                        </Text>
                      </Table.Td>
                      {state.players.map((player) => {
                        const delta = hand.deltas[player.seat] ?? 0
                        return (
                          <Table.Td key={player.seat} ta="right">
                            <Text
                              size="sm"
                              fw={delta !== 0 ? 600 : 400}
                              c={delta > 0 ? 'jade.3' : delta < 0 ? 'red.4' : 'dimmed'}
                            >
                              {delta > 0 ? `+${delta}` : delta}
                            </Text>
                          </Table.Td>
                        )
                      })}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  )
}
