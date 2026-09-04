/**
 * Tile Reference (spec §4.2).
 *
 * Built around one question: "I am holding this tile and it has no number on
 * it — what is it?" So the grid shows faces, not names, and tapping any face
 * answers in one tap with what it is, how to recognise it, and how many exist.
 */
import { useMemo, useState } from 'react'
import { Badge, Card, Chip, Grid, Group, Paper, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core'

import { SET_COMPOSITION, SET_COMPOSITION_SOURCING, TILES, TOTAL_TILES, bonusTileSeat, gloss, type Tile } from '../../core'
import { useSettings } from '../settings'
import { TileFace } from '../components/TileFace'
import { SourceNote } from '../components/SourceNote'

type Filter = 'all' | 'dots' | 'bamboo' | 'characters' | 'winds' | 'dragons' | 'bonus'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dots', label: 'Dots' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'characters', label: 'Characters' },
  { value: 'winds', label: 'Winds' },
  { value: 'dragons', label: 'Dragons' },
  { value: 'bonus', label: 'Flowers & Seasons' },
]

function matches(tile: Tile, filter: Filter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'dots':
    case 'bamboo':
    case 'characters':
      return tile.suit === filter
    case 'winds':
      return tile.kind === 'wind'
    case 'dragons':
      return tile.kind === 'dragon'
    case 'bonus':
      return tile.kind === 'flower' || tile.kind === 'season'
  }
}

export function TileReferenceSection() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { t, tEn } = useSettings()

  const visible = useMemo(() => TILES.filter((tile) => matches(tile, filter)), [filter])
  const selected = TILES.find((tile) => tile.id === selectedId) ?? null

  return (
    <Grid gap="md">
      <Grid.Col span={{ base: 12, sm: 8 }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-end">
            <Title order={4}>Tile Reference</Title>
            <Text size="xs" c="dimmed">
              Tap a tile to identify it
            </Text>
          </Group>

          <Chip.Group multiple={false} value={filter} onChange={(value) => setFilter(value as Filter)}>
            <Group gap={6}>
              {FILTERS.map((option) => (
                <Chip key={option.value} value={option.value} size="sm" radius="sm" variant="light">
                  {option.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>

          <Paper p="sm" radius="md" bg="dark.7" withBorder>
            <Group gap={10}>
              {visible.map((tile) => (
                <UnstyledButton
                  key={tile.id}
                  onClick={() => setSelectedId(tile.id)}
                  aria-label={tile.englishName}
                  style={{
                    borderRadius: 8,
                    outline:
                      selectedId === tile.id ? '3px solid var(--mantine-color-jade-5)' : '3px solid transparent',
                    outlineOffset: 2,
                  }}
                >
                  <TileFace tile={tile} size={54} />
                </UnstyledButton>
              ))}
            </Group>
          </Paper>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        {selected ? (
          <TileDetail tile={selected} label={tEn(selected.termKey)} />
        ) : (
          <Card withBorder radius="md" bg="dark.7" p="md">
            <Stack gap="sm">
              <Title order={5}>A standard set</Title>
              <Text size="sm" c="dimmed">
                {TOTAL_TILES} tiles. Tap any tile on the left and this panel tells you what it is — including
                on sets with no printed numbers.
              </Text>

              <SimpleGrid cols={2} spacing={6} verticalSpacing={6}>
                {SET_COMPOSITION.map((group) => (
                  <Paper key={group.label} p={8} radius="sm" bg="dark.6">
                    <Group justify="space-between" wrap="nowrap" gap={4}>
                      <Text size="sm" fw={600}>
                        {group.label}
                      </Text>
                      <Badge size="sm" variant="light" radius="sm">
                        {group.count}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" lh={1.3}>
                      {group.detail}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>

              <Text size="xs" c="dimmed">
                Suits use {t('dots')}, {t('bamboo')} and {t('characters')} — the names shown throughout the app
                follow your terminology setting.
              </Text>

              <SourceNote sourcing={SET_COMPOSITION_SOURCING} />
            </Stack>
          </Card>
        )}
      </Grid.Col>
    </Grid>
  )
}

function TileDetail({ tile, label }: { tile: Tile; label: string }) {
  const seat = bonusTileSeat(tile)
  const suitGloss = tile.kind === 'suit' ? gloss(tile.suit!) : gloss(tile.termKey)

  return (
    <Card withBorder radius="md" bg="dark.7" p="md">
      <Stack gap="sm" align="stretch">
        <Group align="flex-start" wrap="nowrap" gap="md">
          <TileFace tile={tile} size={92} />
          <Stack gap={4}>
            <Title order={4}>{tile.englishName}</Title>
            <Text size="sm" c="jade.3">
              {label}
            </Text>
            <Badge variant="light" radius="sm" size="sm" w="fit-content">
              {tile.copies} in a set
            </Badge>
          </Stack>
        </Group>

        <Paper p="sm" radius="sm" bg="dark.6">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
            How to recognise it
          </Text>
          <Text size="sm">{tile.recognition}</Text>
        </Paper>

        {suitGloss && (
          <Text size="sm" c="dimmed">
            {suitGloss}
          </Text>
        )}

        {seat && (
          <Text size="sm">
            Scores as <b>your own</b> bonus tile if you are sitting {seat}. Otherwise it is still worth setting
            aside — just not for points at most tables.
          </Text>
        )}

        {tile.kind === 'suit' && (
          <Text size="xs" c="dimmed">
            Colours differ between sets. Count the shapes rather than trusting the colour.
          </Text>
        )}
      </Stack>
    </Card>
  )
}
