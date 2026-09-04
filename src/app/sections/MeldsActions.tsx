/**
 * Melds & Actions (spec §4.3).
 *
 * The two questions this answers mid-hand are "can I take that tile?" and "who
 * gets it if we both want it?", so claim priority is given equal billing with
 * the melds themselves rather than buried as a footnote.
 */
import { Badge, Card, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'

import {
  CLAIM_PRIORITY,
  CLAIM_PRIORITY_SOURCING,
  HAND_SHAPES,
  KONG_RULES,
  KONG_SOURCING,
  MELD_RULES,
} from '../../core'
import { RULESET_LABELS, useSettings } from '../settings'
import { SourceNote } from '../components/SourceNote'

export function MeldsActionsSection() {
  const { ruleset, tEn } = useSettings()
  const shape = HAND_SHAPES[ruleset]

  return (
    <Stack gap="md">
      <Card withBorder radius="md" bg="dark.7" p="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Title order={5}>What a winning hand looks like</Title>
            <Text size="sm" c="dimmed">
              {RULESET_LABELS[ruleset]}: {shape.summary}
            </Text>
          </Stack>
          <Group gap="xs">
            <Stat label="In hand" value={shape.tilesInHand} />
            <Stat label="On win" value={shape.tilesOnWin} />
            <Stat label="Sets" value={shape.sets} />
            <Stat label="Pair" value={shape.pairs} />
          </Group>
        </Group>
      </Card>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <Stack gap="sm">
            <Title order={5}>The melds</Title>
            {MELD_RULES.map((meld) => (
              <Card key={meld.id} withBorder radius="md" bg="dark.7" p="sm">
                <Stack gap={8}>
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Text fw={700} size="md">
                      {tEn(meld.termKey)}
                    </Text>
                    <Badge variant="light" radius="sm" size="sm">
                      {meld.claimableFrom}
                    </Badge>
                  </Group>
                  <Text size="sm">{meld.shape}</Text>
                  <Paper p={8} radius="sm" bg="dark.6">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      When you can claim it
                    </Text>
                    <Text size="sm">{meld.legality}</Text>
                  </Paper>
                  <Text size="sm" c="yellow.4">
                    {meld.concealmentEffect}
                  </Text>
                  <SourceNote sourcing={meld.sourcing} compact />
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Stack gap="md">
            <Card withBorder radius="md" bg="dark.7" p="md">
              <Stack gap="sm">
                <Title order={5}>Two people want the same discard</Title>
                <Text size="sm" c="dimmed">
                  Highest priority wins. This is the rule beginners lose tiles to.
                </Text>
                {CLAIM_PRIORITY.map((step) => (
                  <Paper key={step.rank} p="sm" radius="sm" bg="dark.6">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <Badge circle variant="filled" size="lg" color={step.rank === 1 ? 'jade' : 'gray'}>
                        {step.rank}
                      </Badge>
                      <Stack gap={2}>
                        <Text size="sm" fw={600}>
                          {step.claim}
                        </Text>
                        <Text size="sm" c="dimmed" lh={1.4}>
                          {step.detail}
                        </Text>
                      </Stack>
                    </Group>
                  </Paper>
                ))}
                <SourceNote sourcing={CLAIM_PRIORITY_SOURCING} />
              </Stack>
            </Card>

            <Card withBorder radius="md" bg="dark.7" p="md">
              <Stack gap="sm">
                <Title order={5}>Three kinds of {tEn('kong')}</Title>
                {KONG_RULES.map((kong) => (
                  <Paper key={kong.variant} p="sm" radius="sm" bg="dark.6">
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Text size="sm" fw={600}>
                        {kong.label}
                      </Text>
                      <Badge
                        size="sm"
                        radius="sm"
                        variant="light"
                        color={kong.keepsHandConcealed ? 'jade' : 'gray'}
                      >
                        {kong.keepsHandConcealed ? 'Stays concealed' : 'Exposes your hand'}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" lh={1.4}>
                      {kong.how}
                    </Text>
                    <Text size="sm" lh={1.4} mt={4}>
                      {kong.note}
                    </Text>
                  </Paper>
                ))}
                <SourceNote sourcing={KONG_SOURCING} />
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Paper p={8} radius="sm" bg="dark.6" ta="center" miw={62}>
      <Text fz={22} fw={700} lh={1.1}>
        {value}
      </Text>
      <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
    </Paper>
  )
}
