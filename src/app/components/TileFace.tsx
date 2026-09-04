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

/** Grid positions used by the dot and bamboo layouts, per rank. */
const COLS_2 = [21, 39]
const COLS_3 = [17, 30, 43]

function dotPositions(rank: number): { x: number; y: number; r: number }[] {
  const r = 5.6
  switch (rank) {
    case 1:
      return [{ x: 30, y: 42, r: 12 }]
    case 2:
      return [
        { x: 30, y: 27, r },
        { x: 30, y: 57, r },
      ]
    case 3:
      return [
        { x: 18, y: 24, r },
        { x: 30, y: 42, r },
        { x: 42, y: 60, r },
      ]
    case 4:
      return [24, 60].flatMap((y) => COLS_2.map((x) => ({ x, y, r })))
    case 5:
      return [...[24, 60].flatMap((y) => COLS_2.map((x) => ({ x, y, r }))), { x: 30, y: 42, r }]
    case 6:
      return [22, 42, 62].flatMap((y) => COLS_2.map((x) => ({ x, y, r })))
    case 7:
      return [
        ...COLS_3.map((x, i) => ({ x, y: 20 + i * 6, r: 5 })),
        ...[50, 66].flatMap((y) => COLS_2.map((x) => ({ x, y, r: 5 }))),
      ]
    case 8:
      return [20, 34, 50, 64].flatMap((y) => COLS_2.map((x) => ({ x, y, r: 5 })))
    default:
      return [22, 42, 62].flatMap((y) => COLS_3.map((x) => ({ x, y, r: 5 })))
  }
}

function bambooPositions(rank: number): { x: number; y: number; accent?: boolean }[] {
  switch (rank) {
    case 2:
      return [
        { x: 30, y: 28 },
        { x: 30, y: 56 },
      ]
    case 3:
      return [
        { x: 30, y: 24 },
        { x: 21, y: 58 },
        { x: 39, y: 58 },
      ]
    case 4:
      return [26, 58].flatMap((y) => COLS_2.map((x) => ({ x, y })))
    case 5:
      return [...[24, 60].flatMap((y) => COLS_2.map((x) => ({ x, y }))), { x: 30, y: 42, accent: true }]
    case 6:
      return [24, 42, 60].flatMap((y) => COLS_2.map((x) => ({ x, y })))
    case 7:
      return [{ x: 30, y: 20, accent: true }, ...[38, 54, 70].flatMap((y) => COLS_2.map((x) => ({ x, y })))]
    case 8:
      return [20, 35, 51, 66].flatMap((y) => COLS_2.map((x) => ({ x, y })))
    default:
      return [24, 42, 60].flatMap((y) => COLS_3.map((x) => ({ x, y })))
  }
}

function Stick({ x, y, accent }: { x: number; y: number; accent?: boolean }) {
  const colour = accent ? RED : GREEN
  return (
    <g>
      <rect x={x - 3.6} y={y - 9} width={7.2} height={18} rx={3.6} fill={colour} />
      <rect x={x - 5.2} y={y - 1.6} width={10.4} height={3.2} rx={1.6} fill={colour} opacity={0.7} />
      <rect x={x - 1.4} y={y - 6.5} width={2.8} height={5} rx={1.4} fill={FACE} opacity={0.45} />
    </g>
  )
}

/** 1 Bamboo is a bird, not a stick — the single most common beginner trip-up. */
function Bird() {
  return (
    <g>
      {/* Perch */}
      <rect x={27} y={58} width={6} height={14} rx={3} fill={GREEN} />
      <rect x={20} y={68} width={20} height={3.4} rx={1.7} fill={GREEN} opacity={0.8} />
      {/* Tail feathers, fanning down and left */}
      <path d="M25 48 L12 62" stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <path d="M26 50 L14 66" stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
      {/* Body */}
      <ellipse cx={31} cy={40} rx={9.5} ry={14} fill={GREEN} transform="rotate(14 31 40)" />
      {/* Wing */}
      <ellipse cx={33} cy={41} rx={5} ry={9.5} fill={FACE} opacity={0.42} transform="rotate(14 33 41)" />
      {/* Head */}
      <circle cx={27} cy={22} r={6.4} fill={GREEN} />
      <circle cx={25.5} cy={20.5} r={1.5} fill={INK} />
      {/* Crest and beak */}
      <path d="M27 15 L29 10" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M21 23 L14 25 L21 27 Z" fill={RED} />
    </g>
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

function FaceContent({ tile }: { tile: Tile }) {
  if (tile.kind === 'suit' && tile.rank) {
    if (tile.suit === 'dots') {
      return (
        <>
          {dotPositions(tile.rank).map((dot, i) => (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r={dot.r} fill={i % 2 === 0 ? BLUE : GREEN} />
              <circle cx={dot.x} cy={dot.y} r={dot.r * 0.45} fill={FACE} />
              <circle cx={dot.x} cy={dot.y} r={dot.r * 0.2} fill={RED} />
            </g>
          ))}
        </>
      )
    }
    if (tile.suit === 'bamboo') {
      if (tile.rank === 1) return <Bird />
      return (
        <>
          {bambooPositions(tile.rank).map((stick, i) => (
            <Stick key={i} {...stick} />
          ))}
        </>
      )
    }
    return (
      <>
        <Glyph text={CHINESE_NUMERALS[tile.rank - 1]!} fill={INK} size={27} y={30} />
        <Glyph text="萬" fill={RED} size={25} y={61} />
      </>
    )
  }

  if (tile.kind === 'wind') {
    const chars = { east: '東', south: '南', west: '西', north: '北' } as const
    return <Glyph text={chars[tile.wind!]} fill={INK} size={38} y={44} />
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
      <Glyph text={String(tile.rank)} fill={BLUE} size={17} y={68} />
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
