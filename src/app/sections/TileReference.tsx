/**
 * Tile Reference (spec §4.2).
 *
 * WHAT CHANGED AND WHY.
 * This page used to be a flat grid of all 42 faces with a tap-to-expand panel
 * saying things like "count the circles: 5". That taught nobody anything — if
 * you can see five circles you already know it is five — while hiding the two
 * things a beginner genuinely cannot work out from the tile itself:
 *
 *  1. What the SUIT is called, in whichever language the table is speaking.
 *  2. Which Chinese numeral is which, on the Characters suit, where the rank is
 *     written as 一 二 三 rather than 1 2 3.
 *
 * So the page is now a reference laid out the way the suits actually are: each
 * suit as a complete 1-9 run under its own name, and the honours grouped by
 * what they are. Nothing to tap; everything is on the page.
 */
import { Badge, Card, Group, Paper, Stack, Text, Title } from '@mantine/core'

import {
  HONOUR_NAMING,
  SET_COMPOSITION,
  SET_COMPOSITION_SOURCING,
  SUIT_NAMING,
  SUIT_ORDER,
  TILES,
  TILE_NAMING_SOURCING,
  TOTAL_TILES,
  type GroupNaming,
  type Suit,
  type Tile,
} from '../../core'
import { TileFace } from '../components/TileFace'
import { SourceNote } from '../components/SourceNote'

export function TileReferenceSection() {
  const winds = TILES.filter((tile) => tile.kind === 'wind')
  const dragons = TILES.filter((tile) => tile.kind === 'dragon')
  const flowers = TILES.filter((tile) => tile.kind === 'flower')
  const seasons = TILES.filter((tile) => tile.kind === 'season')

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <Title order={4}>Tile Reference</Title>
        <Text size="xs" c="dimmed">
          {TOTAL_TILES} tiles in a full set
        </Text>
      </Group>

      {SUIT_ORDER.map((suit) => (
        <SuitRun key={suit} suit={suit} />
      ))}

      <TileGroup
        naming={HONOUR_NAMING.winds}
        tiles={winds}
        note="Many sets print no letters at all, so on those the character is the only way to tell them apart. They run East, South, West, North — which is the seating order too, not the compass order."
        copies="Four of each."
      />

      <TileGroup
        naming={HONOUR_NAMING.dragons}
        tiles={dragons}
        note="Tell them apart by colour before you read the character: red 中, green 發, and White, which is either completely blank or an empty blue frame. Both blanks are in circulation and mean the same tile."
        copies="Four of each."
      />

      <Group align="stretch" gap="md" grow wrap="wrap">
        <TileGroup
          naming={HONOUR_NAMING.flowers}
          tiles={flowers}
          note="Bonus tiles. You never build with them — lay one face up when you draw it and take a replacement from the back of the wall."
          copies="One of each."
        />
        <TileGroup
          naming={HONOUR_NAMING.seasons}
          tiles={seasons}
          note="Bonus tiles, the same as Flowers. The number on the tile ties it to a seat: 1 East, 2 South, 3 West, 4 North."
          copies="One of each."
        />
      </Group>

      <Card withBorder radius="md" bg="dark.7" p="md">
        <Stack gap="sm">
          <Title order={5}>A standard set</Title>
          <Group gap={6}>
            {SET_COMPOSITION.map((group) => (
              <Paper key={group.label} p="xs" radius="sm" bg="dark.6" style={{ flex: '1 1 130px' }}>
                <Group justify="space-between" gap={6} wrap="nowrap">
                  <Text size="sm" fw={600}>
                    {group.label}
                  </Text>
                  <Badge variant="light" radius="sm" size="sm">
                    {group.count}
                  </Badge>
                </Group>
                <Text size="10px" c="dimmed" lh={1.3}>
                  {group.detail}
                </Text>
              </Paper>
            ))}
          </Group>
          <SourceNote sourcing={SET_COMPOSITION_SOURCING} />
        </Stack>
      </Card>
    </Stack>
  )
}

/** One suit, 1-9, under its own name. */
function SuitRun({ suit }: { suit: Suit }) {
  const naming = SUIT_NAMING[suit]
  const tiles = TILES.filter((tile) => tile.suit === suit).sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0),
  )

  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm">
        <GroupHeading naming={naming} copies="1–9, four of each." />

        <Group gap={8} align="flex-start" className="no-page-scroll-x">
          {tiles.map((tile) => (
            <LabelledTile key={tile.id} tile={tile} label={String(tile.rank)} />
          ))}
        </Group>

        {suit === 'characters' && (
          <Paper p="sm" radius="sm" bg="dark.6">
            <Text size="xs" c="jade.4" fw={700} tt="uppercase" lh={1.3} mb={4}>
              Reading the rank
            </Text>
            <Text size="sm" c="dimmed" lh={1.45}>
              This is the one suit you cannot count. The rank is the top character and{' '}
              <Text span c="gray.3" fw={600}>
                萬
              </Text>{' '}
              is always underneath it, so the top glyph is the whole answer.
            </Text>
          </Paper>
        )}

        {suit === 'bamboo' && (
          <Text size="xs" c="jade.4" lh={1.4}>
            1 Bamboo is a bird, not a cane. It is the most common tile to misread.
          </Text>
        )}

        <SourceNote sourcing={TILE_NAMING_SOURCING} />
      </Stack>
    </Card>
  )
}

/** Winds, dragons, flowers, seasons — named, then shown. */
function TileGroup({
  naming,
  tiles,
  note,
  copies,
}: {
  naming: GroupNaming
  tiles: Tile[]
  note: string
  copies: string
}) {
  return (
    <Card withBorder radius="md" bg="dark.7" p="md" style={{ minWidth: 280 }}>
      <Stack gap="sm">
        <GroupHeading naming={naming} copies={copies} />
        <Group gap={8} align="flex-start" className="no-page-scroll-x">
          {tiles.map((tile) => (
            <LabelledTile key={tile.id} tile={tile} label={tile.englishName} wide />
          ))}
        </Group>
        <Text size="sm" c="dimmed" lh={1.45}>
          {note}
        </Text>
      </Stack>
    </Card>
  )
}

/**
 * The group's name in every language at once.
 *
 * Not switched by the terminology setting: the whole point of this page is
 * working out what the person across the table just called the thing in your
 * hand, and they may not be using your setting.
 */
function GroupHeading({ naming, copies }: { naming: GroupNaming; copies: string }) {
  return (
    <Stack gap={2}>
      <Group gap={8} align="baseline" wrap="wrap">
        <Title order={5}>{naming.english}</Title>
        <Text size="lg" fw={600} c="gray.3">
          {naming.traditional}
        </Text>
        {naming.simplified && (
          <Text size="sm" c="dimmed">
            / {naming.simplified}
          </Text>
        )}
        <Badge variant="light" color="gray" radius="sm" size="sm">
          {copies}
        </Badge>
      </Group>
      <Text size="xs" c="dimmed" lh={1.4}>
        Mandarin <Text span c="gray.4">{naming.mandarin}</Text> · Cantonese{' '}
        <Text span c="gray.4">{naming.cantonese}</Text> · also called{' '}
        {naming.alsoCalled.join(', ')}
        {naming.alsoWritten &&
          ` · also written ${naming.alsoWritten.characters} (${naming.alsoWritten.mandarin})`}
      </Text>
    </Stack>
  )
}

function LabelledTile({ tile, label, wide }: { tile: Tile; label: string; wide?: boolean }) {
  return (
    <Stack gap={3} align="center" style={{ width: wide ? 72 : 52 }}>
      <TileFace tile={tile} size={wide ? 50 : 48} />
      <Text size="10px" c="dimmed" ta="center" lh={1.2}>
        {label}
      </Text>
    </Stack>
  )
}
