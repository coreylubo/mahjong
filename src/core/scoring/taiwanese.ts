/**
 * Taiwanese (16-tile) scoring, in tai (台).
 *
 * ⚠️ SPEC §8 APPLIES HERE. Taiwanese mahjong is markedly more house-rule driven
 * than Hong Kong play — individual tai values, dealer repeats and win priority
 * all differ by region and family. Values below carry their sources and a
 * confidence marker; anything we could not corroborate is marked `unverified`
 * and surfaced with a warning in the UI rather than presented as fact.
 *
 * Sources consulted:
 * - https://4windsmj.com/kb/rules/taiwanese/rules05.htm
 * - http://mahjong.wikidot.com/rules:taiwanese-scoring
 * - https://rec.games.mahjong.narkive.com/ax54rtqt/taiwanese-mahjong-tai-values
 * - https://rec.games.mahjong.narkive.com/waHyP5Gb/taiwan-rules-crib-sheet
 * - https://mahjmahj.co/styles/taiwanese-mahjong
 * - https://mahjong.dearasia.co.uk/how-to-play-taiwan-style-mahjong-a-complete-guide-for-beginners/
 */

import type { RulesetScoring, ScoringPattern } from './types'

const FOURWINDS = 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'
const WIKIDOT = 'http://mahjong.wikidot.com/rules:taiwanese-scoring'
const RGM_TAI = 'https://rec.games.mahjong.narkive.com/ax54rtqt/taiwanese-mahjong-tai-values'
const CRIB = 'https://rec.games.mahjong.narkive.com/waHyP5Gb/taiwan-rules-crib-sheet'
const MAHJMAHJ = 'https://mahjmahj.co/styles/taiwanese-mahjong'

const PATTERNS: ScoringPattern[] = [
  // ---- 1 tai -----------------------------------------------------------
  {
    id: 'tw-self-draw',
    name: 'Self-draw',
    chinese: '自摸',
    romanized: 'zì mō',
    value: 1,
    category: 'situational',
    description: 'You drew your own winning tile. All three opponents pay.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-concealed',
    name: 'Concealed hand',
    chinese: '門清',
    romanized: 'mén qīng',
    value: 1,
    category: 'hand',
    description: 'No open melds — you never claimed a tile from another player.',
    beginnerNote: 'Concealed plus self-draw is a very common combination and many tables award a bonus tai for the pair of them.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-dealer',
    name: 'Dealer',
    chinese: '莊家',
    romanized: 'zhuāng jiā',
    value: 1,
    category: 'situational',
    description: 'The dealer wins, or is paid by, an extra tai on every hand they deal.',
    beginnerNote: 'Being dealer cuts both ways — you gain a tai when you win and lose one when you do not.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, MAHJMAHJ] },
  },
  {
    id: 'tw-dealer-streak',
    name: 'Dealer repeat',
    chinese: '連莊',
    romanized: 'lián zhuāng',
    value: 2,
    category: 'situational',
    repeatable: true,
    description: 'Each consecutive hand the dealer holds the deal adds a further 2 tai.',
    beginnerNote: 'A long dealer streak escalates fast. This is the single biggest swing in Taiwanese play.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS, MAHJMAHJ],
      note: 'Usually 2 tai per repeat (1 for the streak plus 1 for the dealer bonus, on some charts). Some tables use 1. Confirm before you deal.',
    },
  },
  {
    id: 'tw-flower',
    name: 'Your own flower or season',
    chinese: '正花',
    romanized: 'zhèng huā',
    value: 1,
    category: 'bonus',
    repeatable: true,
    description: 'A flower or season numbered to match your seat: 1 = East, 2 = South, 3 = West, 4 = North.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-dragon-pung',
    name: 'Dragon pung',
    chinese: '三元牌',
    romanized: 'sān yuán pái',
    value: 1,
    category: 'meld',
    repeatable: true,
    description: 'A pung or kong of Red, Green or White Dragon. Counts once each.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT] },
  },
  {
    id: 'tw-seat-wind',
    name: 'Seat wind pung',
    chinese: '門風',
    romanized: 'mén fēng',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of your own seat wind.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT] },
  },
  {
    id: 'tw-round-wind',
    name: 'Round wind pung',
    chinese: '圈風',
    romanized: 'quān fēng',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of the current round wind.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT] },
  },
  {
    id: 'tw-kong-replacement',
    name: 'Win on a kong replacement',
    chinese: '槓上開花',
    romanized: 'gàng shàng kāi huā',
    value: 1,
    category: 'situational',
    description: 'You declared a kong, drew the replacement, and it completed your hand.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT] },
  },
  {
    id: 'tw-last-tile',
    name: 'Win on the last tile',
    chinese: '海底撈月',
    romanized: 'hǎi dǐ lāo yuè',
    value: 1,
    category: 'situational',
    description: 'You won on the final tile of the wall, or the final discard.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT] },
  },
  {
    id: 'tw-robbing-kong',
    name: 'Robbing a kong',
    chinese: '搶槓',
    romanized: 'qiǎng gàng',
    value: 1,
    category: 'situational',
    description: 'You won on a tile another player was adding to their exposed pung.',
    sourcing: {
      confidence: 'varies',
      sources: [FOURWINDS, WIKIDOT],
      note: 'Not all tables permit robbing a kong.',
    },
  },

  // ---- 2 tai -----------------------------------------------------------
  {
    id: 'tw-all-chows',
    name: 'All Chows',
    chinese: '平胡',
    romanized: 'píng hú',
    value: 2,
    category: 'hand',
    description: 'Five chows and a pair, with no honour tiles and no bonus-scoring melds.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, CRIB],
      note: 'Conditions differ: some tables also require the hand to be concealed, or the winning tile to complete a two-sided wait.',
    },
  },
  {
    id: 'tw-all-exposed',
    name: 'All melds claimed',
    chinese: '全求人',
    romanized: 'quán qiú rén',
    value: 2,
    category: 'hand',
    description: 'Every set was claimed from other players, and you win off a discard too. Only the pair is your own.',
    sourcing: { confidence: 'varies', sources: [WIKIDOT, CRIB], note: 'Value seen at 2 and at 4 tai.' },
  },

  // ---- 4 tai -----------------------------------------------------------
  {
    id: 'tw-all-pungs',
    name: 'All Pungs',
    chinese: '碰碰胡',
    romanized: 'pèng pèng hú',
    value: 4,
    category: 'hand',
    description: 'Five pungs or kongs and a pair. No chows.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-half-flush',
    name: 'Half Flush',
    chinese: '混一色',
    romanized: 'hùn yī sè',
    value: 4,
    category: 'hand',
    description: 'One suit plus honour tiles.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-little-dragons',
    name: 'Little Three Dragons',
    chinese: '小三元',
    romanized: 'xiǎo sān yuán',
    value: 4,
    category: 'hand',
    description: 'Pungs of two dragons, plus a pair of the third.',
    sourcing: { confidence: 'varies', sources: [WIKIDOT, CRIB], note: 'Seen at 4 tai; some charts list 2 tai on top of the dragon pungs themselves.' },
  },

  // ---- 8 tai -----------------------------------------------------------
  {
    id: 'tw-full-flush',
    name: 'Full Flush',
    chinese: '清一色',
    romanized: 'qīng yī sè',
    value: 8,
    category: 'hand',
    description: 'One suit only, no honour tiles.',
    sourcing: { confidence: 'established', sources: [FOURWINDS, WIKIDOT, RGM_TAI] },
  },
  {
    id: 'tw-great-dragons',
    name: 'Great Three Dragons',
    chinese: '大三元',
    romanized: 'dà sān yuán',
    value: 8,
    category: 'hand',
    description: 'Pungs or kongs of all three dragons.',
    sourcing: { confidence: 'varies', sources: [WIKIDOT, CRIB], note: 'Commonly 8 tai; some tables pay a flat limit instead.' },
  },
  {
    id: 'tw-little-winds',
    name: 'Little Four Winds',
    chinese: '小四喜',
    romanized: 'xiǎo sì xǐ',
    value: 8,
    category: 'hand',
    description: 'Pungs of three winds, plus a pair of the fourth.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, CRIB],
      note: 'Seen at 8 tai; some tables pay a flat limit instead. Confirm before you play.',
    },
  },
  {
    id: 'tw-five-concealed',
    name: 'Five Concealed Pungs',
    chinese: '五暗刻',
    romanized: 'wǔ àn kè',
    value: 8,
    category: 'hand',
    description: 'All five pungs made without claiming a single tile.',
    sourcing: { confidence: 'unverified', sources: [CRIB], note: 'Found in only one source consulted. Verify before relying on it.' },
  },

  // ---- 16 tai and up ---------------------------------------------------
  {
    id: 'tw-great-winds',
    name: 'Great Four Winds',
    chinese: '大四喜',
    romanized: 'dà sì xǐ',
    value: 16,
    category: 'limit',
    description: 'Pungs or kongs of all four winds.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, CRIB],
      note: 'Seen at 16 tai. Many tables treat this as an uncapped limit hand instead.',
    },
  },
  {
    id: 'tw-all-honours',
    name: 'All Honours',
    chinese: '字一色',
    romanized: 'zì yī sè',
    value: 16,
    category: 'limit',
    description: 'Winds and dragons only, no suited tiles.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, CRIB],
      note: 'Seen at 16 tai. Often played as a limit hand.',
    },
  },
  {
    id: 'tw-heavenly',
    name: 'Heavenly Hand',
    chinese: '天胡',
    romanized: 'tiān hú',
    value: 16,
    isLimit: true,
    category: 'limit',
    description: 'The dealer\'s opening 17 tiles are already a complete hand.',
    sourcing: { confidence: 'varies', sources: [WIKIDOT, CRIB], note: 'Values from 16 to 24 tai appear across sources.' },
  },
  {
    id: 'tw-earthly',
    name: 'Earthly Hand',
    chinese: '地胡',
    romanized: 'dì hú',
    value: 16,
    isLimit: true,
    category: 'limit',
    description: 'A non-dealer wins on the dealer\'s first discard.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, CRIB],
      note: 'Values from 16 to 24 tai appear across sources, matching Heavenly Hand on most charts.',
    },
  },
]

export const TAIWANESE_SCORING: RulesetScoring = {
  ruleset: 'taiwanese',
  unitTermKey: 'tai',
  minimum: {
    common: 0,
    range: '0–3 tai',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MAHJMAHJ],
      note: 'Many Taiwanese tables have no minimum at all — you can win on a bare base score. Others require 1 or 3 tai. This is set by the table, not the ruleset.',
    },
  },
  limit: {
    common: 24,
    range: 'often uncapped',
    sourcing: {
      confidence: 'unverified',
      sources: [WIKIDOT, CRIB],
      note: 'Taiwanese play frequently has no ceiling; where one exists it is a table agreement. Treat 24 as a placeholder, not a rule.',
    },
  },
  patterns: PATTERNS,
}
