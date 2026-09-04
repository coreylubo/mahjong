/**
 * Floating round tracker — upper left (spec §4.1).
 *
 * WHY IT FLOATS.
 * Whose deal it is, and what wind you are, is the one thing you need at every
 * point in a hand and from every screen — you check it while reading the
 * scoring table, not only while reading the turn order. As a card inside one
 * section it was invisible from the other five.
 *
 * WHAT THE BUTTON SHOWS AT REST.
 * The round wind and your own wind, because those are the two values that
 * change what a hand scores: a triplet of the round wind or of your seat wind
 * is worth an extra faan, and forgetting which you are is a scoring error, not
 * a cosmetic one.
 *
 * THE DIAGRAM PUTS YOU AT THE BOTTOM.
 * Every player reads a table from their own seat, so an absolute compass layout
 * would need translating in your head mid-hand. Bottom is you; the seat to your
 * RIGHT is where play goes next, which is the fact beginners most often get
 * backwards — mahjong runs counter-clockwise, which from above looks like it
 * passes to the right.
 */
import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'

import {
  GAME_LENGTH,
  INITIAL_ROUND,
  ROUND_SOURCING,
  advanceRound,
  seatWindForPlayer,
} from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'
import { SourceNote } from './SourceNote'

const WIND_CHAR: Record<string, string> = {
  east: '東',
  south: '南',
  west: '西',
  north: '北',
}

/**
 * Where each seat is drawn, relative to you.
 *
 * Play passes counter-clockwise, which seen from above means the next player is
 * the one on your right — so `+1` sits at `right`, not `left`.
 */
const RELATIVE_SLOTS = [
  { offset: 0, area: 'me', label: 'You' },
  { offset: 1, area: 'right', label: 'Your right' },
  { offset: 2, area: 'across', label: 'Across' },
  { offset: 3, area: 'left', label: 'Your left' },
] as const

export function RoundTracker() {
  const [open, setOpen] = useState(false)
  const { ruleset, t, round, setRound, mySeat, setMySeat } = useSettings()

  const myWind = seatWindForPlayer(mySeat, round.dealerSeat)
  const iAmDealer = mySeat === round.dealerSeat

  return (
    <Popover
      opened={open}
      onChange={setOpen}
      position="bottom-start"
      offset={12}
      width={476}
      radius="md"
      shadow="xl"
      withinPortal
    >
      <Popover.Target>
        <UnstyledButton
          className="round-fab"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Round tracker. Round wind ${round.roundWind}, you are ${myWind}, hand ${round.handNumber}.`}
        >
          <Group gap={10} wrap="nowrap" align="center">
            <Stack gap={0} align="center">
              <Text fz={20} fw={700} lh={1}>
                {WIND_CHAR[round.roundWind]}
              </Text>
              <Text fz={8} c="dimmed" tt="uppercase" fw={700} lh={1.4}>
                Round
              </Text>
            </Stack>

            <Box className="round-fab-divider" />

            <Stack gap={0} align="center">
              <Text fz={20} fw={700} lh={1} c="jade.4">
                {WIND_CHAR[myWind]}
              </Text>
              <Text fz={8} c="dimmed" tt="uppercase" fw={700} lh={1.4}>
                You
              </Text>
            </Stack>
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown p="sm">
        {/*
          Two columns, for the same reason the settings modal is a modal: in
          landscape the phone is ~390px tall, and stacking the diagram above the
          controls pushed "hand finished" — the one thing tapped every hand —
          below a scroll. Width is the axis this orientation actually has.
        */}
        <ScrollArea.Autosize mah="min(74vh, 440px)" type="auto">
          <Group align="flex-start" gap="sm" wrap="nowrap">
            <Stack gap={6} style={{ width: 168, flexShrink: 0 }}>
              <TableDiagram
                dealerSeat={round.dealerSeat}
                mySeat={mySeat}
                onPickSeat={setMySeat}
              />
              <Text fz={9} c="dimmed" lh={1.35} ta="center">
                Tap a seat to say where you sit. Play passes to your right.
              </Text>
            </Stack>

            <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Text size="sm" fw={700}>
                Hand {round.handNumber}
              </Text>
              <Badge variant="light" radius="sm" tt="capitalize">
                {t(round.roundWind)} round
              </Badge>
            </Group>

            {round.dealerStreak > 0 && (
              <Badge size="sm" color="yellow" variant="light" radius="sm" w="fit-content">
                {t('dealer')} has held the deal {round.dealerStreak}×
              </Badge>
            )}

            <Stack gap={6}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Hand finished — who won?
              </Text>
              <Group gap={6} grow>
                <Button
                  size="xs"
                  onClick={() =>
                    setRound(advanceRound(round, { type: 'win', winnerSeat: round.dealerSeat }))
                  }
                >
                  {t('dealer')}
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    setRound(
                      advanceRound(round, {
                        type: 'win',
                        winnerSeat: (round.dealerSeat + 1) % 4,
                      }),
                    )
                  }
                >
                  Someone else
                </Button>
              </Group>
              <Group gap={6} grow>
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  onClick={() => setRound(advanceRound(round, { type: 'draw' }))}
                >
                  Washout
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setRound(INITIAL_ROUND)}
                >
                  Reset
                </Button>
              </Group>
            </Stack>

            <Text size="10px" c="dimmed" lh={1.4}>
              {RULESET_LABELS[ruleset]}: {GAME_LENGTH[ruleset].label}{' '}
              {GAME_LENGTH[ruleset].detail}
              {iAmDealer && ' You are dealing this hand.'}
            </Text>

            <SourceNote sourcing={ROUND_SOURCING} />
            </Stack>
          </Group>
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  )
}

/**
 * The table, seen from your chair. Seat numbers are fixed for the whole game;
 * the winds on them rotate as the deal passes, which is exactly what this is
 * for.
 */
function TableDiagram({
  dealerSeat,
  mySeat,
  onPickSeat,
}: {
  dealerSeat: number
  mySeat: number
  onPickSeat: (seat: number) => void
}) {
  return (
    <Box className="table-diagram">
      {RELATIVE_SLOTS.map(({ offset, area, label }) => {
        const seat = (mySeat + offset) % 4
        const wind = seatWindForPlayer(seat, dealerSeat)
        const isDealer = seat === dealerSeat
        const isMe = offset === 0

        return (
          <UnstyledButton
            key={area}
            className="table-seat"
            style={{ gridArea: area }}
            data-dealer={isDealer || undefined}
            data-me={isMe || undefined}
            onClick={() => onPickSeat(seat)}
            aria-label={`${label}: seat ${seat + 1}, ${wind}${isDealer ? ', dealer' : ''}`}
          >
            <Text fz={19} fw={700} lh={1.1} c={isMe ? 'jade.3' : undefined}>
              {WIND_CHAR[wind]}
            </Text>
            <Text fz={9} c="dimmed" lh={1.2}>
              {label}
            </Text>
            {isDealer && (
              <Text fz={8} fw={700} c="yellow.4" lh={1.2} tt="uppercase">
                Dealer
              </Text>
            )}
          </UnstyledButton>
        )
      })}

      <Box className="table-centre">
        <Text fz={10} c="dimmed" ta="center" lh={1.3}>
          Play runs
          <br />
          this way ↻
        </Text>
      </Box>
    </Box>
  )
}
