/**
 * Hong Kong (Old Style) scoring, in faan.
 *
 * ⚠️ SPEC §8 APPLIES HERE. Nothing in this file is invented from recall.
 * Every value carries the sources it was drawn from and a confidence marker.
 * Where sources disagree — and several do — BOTH values are stated in the note
 * rather than one being silently chosen.
 *
 * Sources consulted:
 * - https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring
 * - http://mcgillmahjong.blogspot.com/p/scoring-in-hong-kong-mahjong.html
 * - https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules
 * - https://www.mahjonggame.hk/learn/hk-mahjong/scoring
 * - https://tilebuddy.app/blog/complete-faan-guide/
 * - https://www.bpmahjong.com/wp-content/uploads/2021/09/Mahjong-Hands-Fan-Scoring.pdf
 */

import type { RulesetScoring, ScoringPattern } from './types'

const WIKIDOT = 'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring'
const MCGILL = 'http://mcgillmahjong.blogspot.com/p/scoring-in-hong-kong-mahjong.html'
const WIKIPEDIA = 'https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules'
const HKAPP = 'https://www.mahjonggame.hk/learn/hk-mahjong/scoring'
const TILEBUDDY = 'https://tilebuddy.app/blog/complete-faan-guide/'

const PATTERNS: ScoringPattern[] = [
  // ---- 1 faan: the bread and butter ------------------------------------
  {
    id: 'hk-all-chows',
    name: 'All Chows',
    chinese: '平和',
    romanized: 'ping wu',
    value: 1,
    category: 'hand',
    description: 'Four chows and a pair, with no scoring honour tiles.',
    beginnerNote: 'The easiest hand to build, and the cheapest. Most beginners end up here.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL],
      note: 'Some tables require the pair to be a non-scoring tile; some disallow any honour tile at all.',
    },
  },
  {
    id: 'hk-dragon-pung',
    name: 'Dragon pung',
    chinese: '三元牌',
    romanized: 'saam yun paai',
    value: 1,
    category: 'meld',
    repeatable: true,
    description: 'A pung or kong of Red, Green or White Dragon. Counts once for each one you have.',
    beginnerNote: 'Three dragon pungs is a completely different, much bigger hand — see Great Three Dragons.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-seat-wind',
    name: 'Seat wind pung',
    chinese: '門風',
    romanized: 'mun fung',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of your own seat wind.',
    beginnerNote: 'Your seat wind depends on where you sit relative to the dealer, and changes each hand.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-round-wind',
    name: 'Round wind pung',
    chinese: '圈風',
    romanized: 'huen fung',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of the current round wind.',
    beginnerNote: 'If your seat wind and the round wind are the same tile, most tables let you count both.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL],
      note: 'Whether a double wind (seat = round) scores 1 faan or 2 differs by table.',
    },
  },
  {
    id: 'hk-self-draw',
    name: 'Self-draw',
    chinese: '自摸',
    romanized: 'zi mo',
    value: 1,
    category: 'situational',
    description: 'You drew your own winning tile instead of claiming a discard.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-concealed',
    name: 'Concealed hand',
    chinese: '門前清',
    romanized: 'mun chin ching',
    value: 1,
    category: 'hand',
    description: 'You never claimed a discard. Winning off a discard is still allowed.',
    beginnerNote: 'A concealed kong from your own hand does not break this. An exposed one does.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-own-flower',
    name: 'Your own flower or season',
    chinese: '正花',
    romanized: 'jing fa',
    value: 1,
    category: 'bonus',
    repeatable: true,
    description: 'A flower or season numbered to match your seat: 1 = East, 2 = South, 3 = West, 4 = North.',
    beginnerNote: 'Flowers are free points. Set them aside face up and draw a replacement immediately.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, HKAPP],
      note: 'Some tables score every flower you hold, not just the ones matching your seat. Agree before you deal.',
    },
  },
  {
    id: 'hk-kong-replacement',
    name: 'Win on a kong replacement',
    chinese: '槓上開花',
    romanized: 'gong soeng hoi fa',
    value: 1,
    category: 'situational',
    description: 'You declared a kong, drew the replacement tile, and it completed your hand.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-robbing-kong',
    name: 'Robbing a kong',
    chinese: '搶槓',
    romanized: 'cheung gong',
    value: 1,
    category: 'situational',
    description: 'Another player added a fourth tile to their exposed pung, and that tile completed your hand.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL],
      note: 'Not every table allows robbing a kong at all. Concealed kongs are usually not robbable.',
    },
  },
  {
    id: 'hk-last-tile',
    name: 'Win on the last tile',
    chinese: '海底撈月',
    romanized: 'hoi dai lou yuet',
    value: 1,
    category: 'situational',
    description: 'You won on the very last tile drawn from the wall, or the last discard of the hand.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL] },
  },

  // ---- 3 faan and up ---------------------------------------------------
  {
    id: 'hk-all-pungs',
    name: 'All Pungs',
    chinese: '對對糊',
    romanized: 'deui deui wu',
    value: 3,
    category: 'hand',
    description: 'Four pungs or kongs and a pair. No chows anywhere in the hand.',
    beginnerNote: 'A reliable step up from All Chows, and it stacks with flush hands.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-half-flush',
    name: 'Half Flush',
    chinese: '混一色',
    romanized: 'wun yat sik',
    value: 3,
    category: 'hand',
    description: 'Every tile is from one single suit, plus any honour tiles (winds and dragons).',
    beginnerNote: 'Often the most achievable big hand — honours give you flexibility a Full Flush does not.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-little-dragons',
    name: 'Little Three Dragons',
    chinese: '小三元',
    romanized: 'siu saam yuen',
    value: 5,
    category: 'hand',
    description: 'Pungs of two dragons, plus a pair of the third.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL, TILEBUDDY],
      note: 'SOURCES CONFLICT: seen at both 5 faan and 3 faan, and some charts list it as 2 faan on top of the two dragon pungs you already score (which comes to 4). Confirm with your table.',
    },
  },
  {
    id: 'hk-full-flush',
    name: 'Full Flush',
    chinese: '清一色',
    romanized: 'ching yat sik',
    value: 6,
    category: 'hand',
    description: 'Every tile from one single suit, with no honour tiles at all.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL, TILEBUDDY],
      note: 'SOURCES CONFLICT: commonly listed as 6 faan, but 7 faan appears in several Hong Kong charts. Agree the value before you play.',
    },
  },
  {
    id: 'hk-great-dragons',
    name: 'Great Three Dragons',
    chinese: '大三元',
    romanized: 'daai saam yuen',
    value: 8,
    category: 'hand',
    description: 'Pungs or kongs of all three dragons.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL],
      note: 'SOURCES CONFLICT: 8 faan on some charts, an outright limit hand on others.',
    },
  },
  {
    id: 'hk-little-winds',
    name: 'Little Four Winds',
    chinese: '小四喜',
    romanized: 'siu sei hei',
    value: 8,
    category: 'hand',
    description: 'Pungs of three winds, plus a pair of the fourth.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MCGILL],
      note: 'Frequently played as a limit hand rather than a fixed value.',
    },
  },

  // ---- Limit hands -----------------------------------------------------
  {
    id: 'hk-great-winds',
    name: 'Great Four Winds',
    chinese: '大四喜',
    romanized: 'daai sei hei',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'Pungs or kongs of all four winds.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-all-honours',
    name: 'All Honours',
    chinese: '字一色',
    romanized: 'ji yat sik',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'Every tile is a wind or a dragon. No suited tiles at all.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-thirteen-orphans',
    name: 'Thirteen Orphans',
    chinese: '十三么',
    romanized: 'sap saam yiu',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'One of each 1 and 9 from all three suits, one of each wind and dragon, plus a duplicate of any one of them.',
    beginnerNote: 'Famous, spectacular, and almost never happens. Do not chase it.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-all-kongs',
    name: 'All Kongs',
    chinese: '十八羅漢',
    romanized: 'sap baat lo hon',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'Four kongs and a pair.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-nine-gates',
    name: 'Nine Gates',
    chinese: '九子連環',
    romanized: 'gau ji lin waan',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'A concealed 1-1-1-2-3-4-5-6-7-8-9-9-9 in one suit, waiting on any tile of that suit.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-heavenly',
    name: 'Heavenly Hand',
    chinese: '天糊',
    romanized: 'tin wu',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'The dealer\'s starting hand is already complete, before discarding anything.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-earthly',
    name: 'Earthly Hand',
    chinese: '地糊',
    romanized: 'dei wu',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'A non-dealer wins on the dealer\'s very first discard.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, MCGILL] },
  },
]

export const HONG_KONG_SCORING: RulesetScoring = {
  ruleset: 'hongKong',
  unitTermKey: 'faan',
  minimum: {
    common: 3,
    range: '0–5 faan',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, HKAPP, 'https://mahjongcompare.com/styles/hong-kong'],
      note: 'Three faan is the most common minimum. Casual tables often drop to 1 or 0 (a "chicken hand" win); competitive play sometimes uses 5.',
    },
  },
  limit: {
    common: 10,
    range: '8–13 faan',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, WIKIPEDIA, HKAPP],
      note: 'Ten faan is the usual ceiling; 13 is the theoretical maximum. Lower ceilings keep the stakes down.',
    },
  },
  patterns: PATTERNS,
}
