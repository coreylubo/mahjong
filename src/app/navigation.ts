/**
 * The section list, in one place.
 *
 * Both the app shell (which renders the active section) and the floating nav
 * (which lists them all) need this, and importing it from either of those would
 * make them import each other.
 */
import { SetupSection } from './sections/Setup'
import { TurnsSection } from './sections/Turns'
import { TileReferenceSection } from './sections/TileReference'
import { MeldsActionsSection } from './sections/MeldsActions'
import { ScoringReferenceSection } from './sections/ScoringReference'
import { ScorekeeperSection } from './sections/Scorekeeper'

export const SECTIONS = [
  { id: 'setup', label: 'Setup', hint: 'Before the first tile', Component: SetupSection },
  { id: 'turn', label: 'Turns', hint: 'Yours, and everyone else\u2019s', Component: TurnsSection },
  { id: 'tiles', label: 'Tiles', hint: 'What am I holding?', Component: TileReferenceSection },
  { id: 'melds', label: 'Melds', hint: 'Can I claim that?', Component: MeldsActionsSection },
  { id: 'scoring', label: 'Scoring', hint: 'What is it worth?', Component: ScoringReferenceSection },
  { id: 'scores', label: 'Scores', hint: 'Table running total', Component: ScorekeeperSection },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']
