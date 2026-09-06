/**
 * Tile data (spec §4.2).
 *
 * The primary use case here is a beginner holding a physical tile with NO
 * Arabic numeral on it, trying to work out what it is. So every tile carries
 * enough data for the UI to draw a recognisable face and to describe the tile
 * in words ("count the circles", "the green one").
 *
 * Sources consulted for set composition:
 * - https://en.wikipedia.org/wiki/Mahjong_tiles
 * - https://mahjongplaybook.com/start-here/mahjong-tile-symbols/
 * - https://www.mahjongsolitaire.games/pages/mahjong-tiles
 */

import type { Identified, Sourced } from './types'

export type Suit = 'dots' | 'bamboo' | 'characters'
export type Wind = 'east' | 'south' | 'west' | 'north'
export type Dragon = 'red' | 'green' | 'white'
export type TileKind = 'suit' | 'wind' | 'dragon' | 'flower' | 'season'

export interface Tile extends Identified {
  kind: TileKind
  /** Terminology key for this tile's name. Resolved through the terminology table. */
  termKey: string
  /** Plain-English label always available as a fallback and for search. */
  englishName: string
  suit?: Suit
  /** 1–9 for suited tiles; 1–4 for flowers and seasons (their seat order). */
  rank?: number
  wind?: Wind
  dragon?: Dragon
  /** How many of this exact tile exist in a standard set. */
  copies: number
  /** How to recognise it on a set with no printed numerals. */
  recognition: string
}

/** Winds in play order — East, South, West, North (spec §4.1). */
export const WIND_ORDER: readonly Wind[] = ['east', 'south', 'west', 'north'] as const

export const SUIT_ORDER: readonly Suit[] = ['dots', 'bamboo', 'characters'] as const

/** Chinese numerals as printed on Character tiles — the whole point of §4.2. */
export const CHINESE_NUMERALS: readonly string[] = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

/**
 * What each group of tiles is called.
 *
 * A beginner's first question about a tile is usually not "which one is it" but
 * "what is this whole family called" — and the answer differs by who you ask,
 * in English as much as in Chinese. Dots are Circles or Wheels; Characters are
 * Myriads or Cracks. Those alternatives are listed rather than hidden, because
 * the person across the table will use one of them.
 */
export interface GroupNaming {
  english: string
  /** Other English names in common use. The reader will hear these. */
  alsoCalled: readonly string[]
  traditional: string
  /** Only where it differs from the traditional form. */
  simplified?: string
  /** Mandarin, pinyin. */
  mandarin: string
  /** Cantonese, Jyutping. */
  cantonese: string
  /** A second Chinese name in circulation for the same group. */
  alsoWritten?: { characters: string; mandarin: string }
}

export const SUIT_NAMING: Record<Suit, GroupNaming> = {
  dots: {
    english: 'Dots',
    alsoCalled: ['Circles', 'Wheels', 'Coins'],
    traditional: '筒子',
    mandarin: 'tǒngzi',
    cantonese: 'tung4 zi2',
    alsoWritten: { characters: '餅子', mandarin: 'bǐngzi' },
  },
  bamboo: {
    english: 'Bamboo',
    alsoCalled: ['Sticks', 'Bams', 'Ropes'],
    traditional: '索子',
    mandarin: 'suǒzi',
    cantonese: 'sok3 zi2',
    alsoWritten: { characters: '條子 / 条子', mandarin: 'tiáozi' },
  },
  characters: {
    english: 'Characters',
    alsoCalled: ['Myriads', 'Cracks', 'Wan'],
    traditional: '萬子',
    simplified: '万子',
    mandarin: 'wànzi',
    cantonese: 'maan6 zi2',
  },
}

export type HonourGroup = 'winds' | 'dragons' | 'flowers' | 'seasons'

export const HONOUR_NAMING: Record<HonourGroup, GroupNaming> = {
  winds: {
    english: 'Winds',
    alsoCalled: ['Directions'],
    traditional: '風牌',
    simplified: '风牌',
    mandarin: 'fēngpái',
    cantonese: 'fung1 paai2',
  },
  dragons: {
    english: 'Dragons',
    alsoCalled: ['Honours', 'Three Fundamentals'],
    traditional: '三元牌',
    mandarin: 'sānyuánpái',
    cantonese: 'saam1 jyun4 paai2',
  },
  flowers: {
    english: 'Flowers',
    alsoCalled: ['Four Gentlemen'],
    traditional: '四君子',
    mandarin: 'sìjūnzi',
    cantonese: 'sei3 gwan1 zi2',
  },
  seasons: {
    english: 'Seasons',
    alsoCalled: ['Four Seasons'],
    traditional: '四季',
    mandarin: 'sìjì',
    cantonese: 'sei3 gwai3',
  },
}

export const TILE_NAMING_SOURCING: Sourced = {
  confidence: 'varies',
  sources: ['https://en.wikipedia.org/wiki/Mahjong_tiles'],
  note:
    'Names and characters are from Wikipedia\'s tile article, whose Cantonese is given in Jyutping — a stricter scheme than the ad-hoc spellings used elsewhere in this app and at most Hong Kong tables, so the two will not always match letter for letter. Several groups genuinely carry two Chinese names (Dots are 筒子 or 餅子, Bamboo 索子 or 條子); both are given rather than one being picked.',
}

const SUIT_RECOGNITION: Record<Suit, (rank: number) => string> = {
  dots: (rank) => `Count the circles: ${rank}.`,
  bamboo: (rank) =>
    rank === 1
      ? 'A single bird (usually a peacock or sparrow), not a stick. This is 1 Bamboo.'
      : `Count the sticks: ${rank}.`,
  characters: (rank) => `Top glyph is ${CHINESE_NUMERALS[rank - 1]} (${rank}); bottom glyph is 萬.`,
}

const WIND_LABEL: Record<Wind, { en: string; char: string }> = {
  east: { en: 'East', char: '東' },
  south: { en: 'South', char: '南' },
  west: { en: 'West', char: '西' },
  north: { en: 'North', char: '北' },
}

const DRAGON_LABEL: Record<Dragon, { en: string; char: string; termKey: string; recognition: string }> = {
  red: { en: 'Red Dragon', char: '中', termKey: 'redDragon', recognition: 'A red 中 in the middle of the tile.' },
  green: { en: 'Green Dragon', char: '發', termKey: 'greenDragon', recognition: 'A green 發. The most angular of the three.' },
  white: {
    en: 'White Dragon',
    char: '白',
    termKey: 'whiteDragon',
    recognition: 'Completely blank, or a blue/green rectangular frame. Nothing printed inside.',
  },
}

/**
 * Flowers and seasons are numbered 1–4 and each is tied to a seat wind
 * (1 = East, 2 = South, 3 = West, 4 = North). That pairing is what makes a
 * bonus tile "yours" for scoring.
 */
export const FLOWER_NAMES: readonly string[] = ['Plum', 'Orchid', 'Chrysanthemum', 'Bamboo']
export const SEASON_NAMES: readonly string[] = ['Spring', 'Summer', 'Autumn', 'Winter']

function suitTiles(): Tile[] {
  const tiles: Tile[] = []
  for (const suit of SUIT_ORDER) {
    for (let rank = 1; rank <= 9; rank += 1) {
      tiles.push({
        id: `${suit[0]}${rank}`,
        kind: 'suit',
        termKey: suit,
        englishName: `${rank} ${suit === 'characters' ? 'Characters' : suit === 'dots' ? 'Dots' : 'Bamboo'}`,
        suit,
        rank,
        copies: 4,
        recognition: SUIT_RECOGNITION[suit](rank),
      })
    }
  }
  return tiles
}

function honourTiles(): Tile[] {
  const winds: Tile[] = WIND_ORDER.map((wind) => ({
    id: `w-${wind}`,
    kind: 'wind' as const,
    termKey: wind,
    englishName: `${WIND_LABEL[wind].en} Wind`,
    wind,
    copies: 4,
    recognition: `A single character: ${WIND_LABEL[wind].char}.`,
  }))
  const dragons: Tile[] = (['red', 'green', 'white'] as const).map((dragon) => ({
    id: `d-${dragon}`,
    kind: 'dragon' as const,
    termKey: DRAGON_LABEL[dragon].termKey,
    englishName: DRAGON_LABEL[dragon].en,
    dragon,
    copies: 4,
    recognition: DRAGON_LABEL[dragon].recognition,
  }))
  return [...winds, ...dragons]
}

function bonusTiles(): Tile[] {
  const flowers: Tile[] = FLOWER_NAMES.map((name, index) => ({
    id: `f${index + 1}`,
    kind: 'flower' as const,
    termKey: 'flowers',
    englishName: `Flower ${index + 1} — ${name}`,
    rank: index + 1,
    copies: 1,
    recognition: `A flower picture with a small ${index + 1} in the corner. Belongs to the ${WIND_LABEL[WIND_ORDER[index]!].en} seat.`,
  }))
  const seasons: Tile[] = SEASON_NAMES.map((name, index) => ({
    id: `s${index + 1}`,
    kind: 'season' as const,
    termKey: 'seasons',
    englishName: `Season ${index + 1} — ${name}`,
    rank: index + 1,
    copies: 1,
    recognition: `A seasonal scene with a small ${index + 1} in the corner. Belongs to the ${WIND_LABEL[WIND_ORDER[index]!].en} seat.`,
  }))
  return [...flowers, ...seasons]
}

/** Every distinct tile in a standard set, in reference order. */
export const TILES: readonly Tile[] = [...suitTiles(), ...honourTiles(), ...bonusTiles()]

export const TILES_BY_ID: Readonly<Record<string, Tile>> = Object.fromEntries(
  TILES.map((tile) => [tile.id, tile]),
)

/** Which seat wind a numbered flower or season belongs to. */
export function bonusTileSeat(tile: Tile): Wind | undefined {
  if (tile.kind !== 'flower' && tile.kind !== 'season') return undefined
  return WIND_ORDER[(tile.rank ?? 1) - 1]
}

export interface SetComposition {
  label: string
  detail: string
  count: number
}

/**
 * The standard 144-tile set, broken down.
 * 108 suited + 16 winds + 12 dragons + 8 bonus = 144.
 */
export const SET_COMPOSITION: readonly SetComposition[] = [
  { label: 'Dots', detail: '1–9, four of each', count: 36 },
  { label: 'Bamboo', detail: '1–9, four of each', count: 36 },
  { label: 'Characters', detail: '1–9, four of each', count: 36 },
  { label: 'Winds', detail: 'East, South, West, North — four of each', count: 16 },
  { label: 'Dragons', detail: 'Red, Green, White — four of each', count: 12 },
  { label: 'Flowers', detail: 'Four different tiles, one of each', count: 4 },
  { label: 'Seasons', detail: 'Four different tiles, one of each', count: 4 },
]

export const TOTAL_TILES = SET_COMPOSITION.reduce((sum, group) => sum + group.count, 0)

export const SET_COMPOSITION_SOURCING: Sourced = {
  confidence: 'established',
  sources: [
    'https://en.wikipedia.org/wiki/Mahjong_tiles',
    'https://mahjongplaybook.com/start-here/mahjong-tile-symbols/',
  ],
  note: 'Some sets add extra blank spare tiles or jokers. Those are not used in Hong Kong or Taiwanese play — set them aside.',
}
