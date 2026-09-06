/**
 * Draws a tile face (spec §4.2).
 *
 * The point of this component is the beginner holding a physical tile with no
 * Arabic numeral on it. So the face is drawn the way the tile actually looks —
 * count the circles, count the sticks, read the glyph — rather than shown as a
 * number. The number is a caption elsewhere, never the primary identifier.
 *
 * Rendering only. All tile data comes from src/core.
 */
import type { Tile } from '../../core'
import { CHINESE_NUMERALS } from '../../core'

const WIDTH = 60
const HEIGHT = 84

const FACE = '#f4efe2'
const FACE_EDGE = '#cbbfa8'
const INK = '#1f2933'
const RED = '#c0392b'
const GREEN = '#1e7a4c'
const BLUE = '#2f5d99'

/*
 * PIP LAYOUTS AND COLOURS ARE COPIED FROM A REAL SET, NOT INVENTED.
 *
 * Both suits colour their pips in fixed patterns that a player genuinely reads
 * — 9 Dots is three blue, three red, three green rows, and 6 Dots is green over
 * four red — so getting the colours "close enough" makes the drawing useless
 * for the one job it has, which is recognising a tile you are holding.
 *
 * Reference: the tile plates on https://en.wikipedia.org/wiki/Mahjong_tiles
 */

interface Pip {
  x: number
  y: number
  r: number
  fill: string
}

const COLS_2 = [20, 40]
const COLS_3 = [16, 30, 44]

function grid(cols: number[], rows: number[], r: number, fill: string | string[]): Pip[] {
  return rows.flatMap((y, row) =>
    cols.map((x) => ({ x, y, r, fill: Array.isArray(fill) ? fill[row]! : fill })),
  )
}

function dotPips(rank: number): Pip[] {
  switch (rank) {
    case 2:
      return [
        { x: 30, y: 28, r: 8, fill: BLUE },
        { x: 30, y: 58, r: 8, fill: GREEN },
      ]
    case 3:
      // A descending diagonal, blue to green through red.
      return [
        { x: 18, y: 24, r: 7.5, fill: BLUE },
        { x: 30, y: 42, r: 7.5, fill: RED },
        { x: 42, y: 60, r: 7.5, fill: GREEN },
      ]
    case 4:
      return [
        { x: 20, y: 28, r: 7.5, fill: GREEN },
        { x: 40, y: 28, r: 7.5, fill: BLUE },
        { x: 20, y: 58, r: 7.5, fill: BLUE },
        { x: 40, y: 58, r: 7.5, fill: GREEN },
      ]
    case 5:
      return [
        { x: 20, y: 24, r: 7, fill: GREEN },
        { x: 40, y: 24, r: 7, fill: BLUE },
        { x: 30, y: 42, r: 7, fill: RED },
        { x: 20, y: 60, r: 7, fill: BLUE },
        { x: 40, y: 60, r: 7, fill: GREEN },
      ]
    case 6:
      // Green across the top, then four red.
      return grid(COLS_2, [24, 42, 60], 7, [GREEN, RED, RED])
    case 7:
      // Three green stepping down to the right, then four red.
      return [
        { x: 16, y: 19, r: 6, fill: GREEN },
        { x: 26, y: 25, r: 6, fill: GREEN },
        { x: 36, y: 31, r: 6, fill: GREEN },
        ...grid(COLS_2, [50, 66], 6.5, RED),
      ]
    case 8:
      return grid(COLS_2, [18, 34, 50, 66], 6.5, BLUE)
    default:
      // Nine: a blue row, a red row, a green row.
      return grid(COLS_3, [24, 44, 64], 6.5, [BLUE, RED, GREEN])
  }
}

/**
 * A pip, drawn as the concentric target it actually is.
 *
 * Real Dots tiles are not filled discs: each pip is a bullseye of alternating
 * rings around a solid centre. That reads very differently at a glance, and it
 * is how a player recognises the suit across the table, so it is worth drawing
 * properly rather than as a blob.
 *
 * Ring weights are proportional to the pip radius so 9 Dots — where the pips
 * are smallest — still resolves into rings instead of turning to mud.
 */
function Dot({ x, y, r, fill }: Pip) {
  return (
    <g>
      {/* Pale ground, so the rings read as rings rather than as a filled disc. */}
      <circle cx={x} cy={y} r={r} fill={fill} opacity={0.16} />
      {/* Outer ring */}
      <circle
        cx={x}
        cy={y}
        r={r * 0.82}
        fill="none"
        stroke={fill}
        strokeWidth={r * 0.34}
      />
      {/* Inner ring */}
      <circle
        cx={x}
        cy={y}
        r={r * 0.42}
        fill="none"
        stroke={fill}
        strokeWidth={r * 0.22}
      />
      {/* Centre */}
      <circle cx={x} cy={y} r={r * 0.15} fill={fill} />
    </g>
  )
}

/**
 * 1 Dot is a single oversized target with more rings than the others, and it
 * is the one pip that carries three colours rather than one.
 */
function SingleDot() {
  const ring = (r: number, stroke: string, w: number) => (
    <circle cx={30} cy={42} r={r} fill="none" stroke={stroke} strokeWidth={w} />
  )
  return (
    <g>
      <circle cx={30} cy={42} r={16} fill={BLUE} opacity={0.12} />
      {ring(15, BLUE, 2.6)}
      {ring(11.4, GREEN, 2.4)}
      {ring(7.8, RED, 2.2)}
      {ring(4.4, GREEN, 1.8)}
      <circle cx={30} cy={42} r={1.9} fill={RED} />
    </g>
  )
}

interface Cane {
  x: number
  y: number
  fill: string
  /** Degrees, for the crossed canes on 8 Bamboo. */
  rotate?: number
}

function bambooCanes(rank: number): Cane[] {
  switch (rank) {
    case 2:
      return [
        { x: 30, y: 28, fill: GREEN },
        { x: 30, y: 56, fill: GREEN },
      ]
    case 3:
      return [
        { x: 30, y: 25, fill: GREEN },
        { x: 20, y: 58, fill: GREEN },
        { x: 40, y: 58, fill: GREEN },
      ]
    case 4:
      return [28, 58].flatMap((y) => COLS_2.map((x) => ({ x, y, fill: GREEN })))
    case 5:
      return [
        ...[25, 60].flatMap((y) => COLS_2.map((x) => ({ x, y, fill: GREEN }))),
        { x: 30, y: 42, fill: RED },
      ]
    case 6:
      return [30, 58].flatMap((y) => COLS_3.map((x) => ({ x, y, fill: GREEN })))
    case 7:
      return [
        { x: 30, y: 18, fill: RED },
        ...[41, 63].flatMap((y) => COLS_3.map((x) => ({ x, y, fill: GREEN }))),
      ]
    case 8:
      // Two mirrored chevrons — the one rank that is not a plain grid.
      return [
        { x: 15, y: 28, fill: GREEN },
        { x: 26, y: 28, fill: GREEN, rotate: -28 },
        { x: 34, y: 28, fill: GREEN, rotate: 28 },
        { x: 45, y: 28, fill: GREEN },
        { x: 15, y: 60, fill: GREEN },
        { x: 26, y: 60, fill: GREEN, rotate: 28 },
        { x: 34, y: 60, fill: GREEN, rotate: -28 },
        { x: 45, y: 60, fill: GREEN },
      ]
    default:
      // Nine: the middle column is red.
      return [24, 44, 64].flatMap((y) =>
        COLS_3.map((x) => ({ x, y, fill: x === 30 ? RED : GREEN })),
      )
  }
}

/** One cane: a segmented stalk with a cap at each end. */
function Cane({ x, y, fill, rotate }: Cane) {
  return (
    <g transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      <rect x={x - 2} y={y - 8} width={4} height={16} fill={fill} />
      <rect x={x - 5} y={y - 9.5} width={10} height={3} rx={1.5} fill={fill} />
      <rect x={x - 5} y={y + 6.5} width={10} height={3} rx={1.5} fill={fill} />
      <rect x={x - 4} y={y - 1.4} width={8} height={2.8} rx={1.4} fill={fill} />
    </g>
  )
}

/**
 * 1 Bamboo is a bird, not a cane — the single most common beginner trip-up, and
 * the reason this suit needs a drawing at all rather than a count.
 *
 * Drawn from the reference plate: red crest, blue body facing left, long
 * striped tail falling to the lower left, green perch.
 */
function Bird() {
  return (
    <g>
      {/* Perch */}
      <rect x={16} y={62} width={28} height={3} rx={1.5} fill={GREEN} />
      <rect x={28} y={54} width={3} height={10} fill={GREEN} />

      {/* Tail — the striped fan that makes this tile unmistakable */}
      <path d="M28 52 L20 76" stroke={BLUE} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M30 52 L26 78" stroke={RED} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M32 52 L33 78" stroke={GREEN} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M34 51 L40 75" stroke={BLUE} strokeWidth={2.4} strokeLinecap="round" />

      {/* Body */}
      <ellipse cx={30} cy={40} rx={9} ry={13} fill={BLUE} transform="rotate(-12 30 40)" />
      <ellipse cx={31} cy={41} rx={4.5} ry={8} fill={FACE} opacity={0.35} transform="rotate(-12 31 41)" />

      {/* Head, eye and beak */}
      <circle cx={25} cy={24} r={6} fill={BLUE} />
      <circle cx={23.5} cy={23} r={1.4} fill={FACE} />
      <path d="M19 25 L12 27 L19 29 Z" fill={GREEN} />

      {/* Crest */}
      <path d="M25 17 L23 11" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M28 18 L29 12" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  )
}

/**
 * The rank mark real sets print in the top-left corner.
 *
 * Western-numbered sets carry it in red, which is exactly the affordance a
 * beginner needs — it is the only thing on a Dots or Bamboo tile you can read
 * without counting, and on a Characters or Wind tile it is the only thing you
 * can read at all without knowing the script.
 */
function CornerMark({ text }: { text: string }) {
  return (
    <text
      x={8}
      y={13}
      textAnchor="start"
      fontSize={13}
      fontWeight={700}
      fill={RED}
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
    >
      {text}
    </text>
  )
}

function Glyph({ text, fill, size, y }: { text: string; fill: string; size: number; y: number }) {
  return (
    <text
      x={30}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight={600}
      fill={fill}
      style={{ fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", serif' }}
    >
      {text}
    </text>
  )
}

/**
 * Pip art sits in its own group nudged down the face, so the corner mark has
 * clear space rather than colliding with the top row of a 9.
 */
function Pips({ children }: { children: React.ReactNode }) {
  return <g transform="translate(0 5)">{children}</g>
}

function FaceContent({ tile }: { tile: Tile }) {
  if (tile.kind === 'suit' && tile.rank) {
    if (tile.suit === 'dots') {
      return (
        <>
          <CornerMark text={String(tile.rank)} />
          <Pips>{tile.rank === 1 ? <SingleDot /> : dotPips(tile.rank).map((pip, i) => <Dot key={i} {...pip} />)}</Pips>
        </>
      )
    }
    if (tile.suit === 'bamboo') {
      return (
        <>
          <CornerMark text={String(tile.rank)} />
          <Pips>
            {tile.rank === 1 ? <Bird /> : bambooCanes(tile.rank).map((cane, i) => <Cane key={i} {...cane} />)}
          </Pips>
        </>
      )
    }
    return (
      <>
        <CornerMark text={String(tile.rank)} />
        <Glyph text={CHINESE_NUMERALS[tile.rank - 1]!} fill={INK} size={25} y={34} />
        <Glyph text="萬" fill={RED} size={23} y={63} />
      </>
    )
  }

  if (tile.kind === 'wind') {
    const chars = { east: '東', south: '南', west: '西', north: '北' } as const
    const letters = { east: 'E', south: 'S', west: 'W', north: 'N' } as const
    return (
      <>
        {/* Many sets print no letter at all, so this is the tile made readable. */}
        <CornerMark text={letters[tile.wind!]} />
        <Glyph text={chars[tile.wind!]} fill={INK} size={36} y={48} />
      </>
    )
  }

  if (tile.kind === 'dragon') {
    if (tile.dragon === 'red') return <Glyph text="中" fill={RED} size={38} y={44} />
    if (tile.dragon === 'green') return <Glyph text="發" fill={GREEN} size={36} y={44} />
    // White dragon: a blank tile, or an empty blue frame. Both are in circulation.
    return <rect x={14} y={22} width={32} height={42} rx={3} fill="none" stroke={BLUE} strokeWidth={2.4} />
  }

  // Flowers and seasons: a simple motif plus the number that ties it to a seat.
  const isFlower = tile.kind === 'flower'
  return (
    <>
      {isFlower ? (
        <g>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx={30}
              cy={30}
              rx={5}
              ry={11}
              fill={RED}
              opacity={0.85}
              transform={`rotate(${angle} 30 38)`}
            />
          ))}
          <circle cx={30} cy={38} r={4.5} fill="#e6a817" />
        </g>
      ) : (
        <g>
          <path d="M16 46 L26 28 L34 40 L42 24 L48 46 Z" fill={GREEN} opacity={0.85} />
          <circle cx={40} cy={22} r={5} fill="#e6a817" />
        </g>
      )}
      <CornerMark text={String(tile.rank)} />
    </>
  )
}

export interface TileFaceProps {
  tile: Tile
  /** Rendered width in px. Height follows the tile's aspect ratio. */
  size?: number
  /** Dim the tile — used for tiles filtered out of the current view. */
  muted?: boolean
}

export function TileFace({ tile, size = 60, muted = false }: TileFaceProps) {
  const height = (size / WIDTH) * HEIGHT
  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={tile.englishName}
      style={{ opacity: muted ? 0.35 : 1, display: 'block' }}
    >
      <rect x={1} y={1} width={WIDTH - 2} height={HEIGHT - 2} rx={7} fill={FACE} stroke={FACE_EDGE} strokeWidth={1.5} />
      <rect x={4} y={4} width={WIDTH - 8} height={HEIGHT - 8} rx={5} fill="none" stroke="#e2d9c6" strokeWidth={1} />
      <FaceContent tile={tile} />
    </svg>
  )
}
