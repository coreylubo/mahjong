/**
 * Hong Kong scoring, in faan.
 *
 * ⚠️ SPEC §8 APPLIES HERE. Nothing in this file is written from recall.
 *
 * PRIMARY SOURCE: the "Hong Kong Mahjong Rule Sheet" (香港麻雀正統牌型) v1.0,
 * 3 April 2025, by /u/danma — the PDF supplied by the project owner. Every faan
 * value below is transcribed from that sheet, including its indentation rule
 * (see `replaces`). Where the sheet disagrees with the online sources consulted
 * earlier, the entry is marked `varies` and BOTH readings are stated rather
 * than one being silently chosen.
 *
 * The sheet's Chinese hand names are embedded in a subsetted font and could not
 * be extracted from the PDF, so the Chinese names here come from the general
 * references below instead. The faan values are the sheet's.
 *
 * ADJUDICATION PASS. Six entries previously carried an unresolved conflict
 * between the sheet and "several online charts". Those charts were re-fetched
 * and checked one by one:
 *
 *  - Full Flush, All Honours and Small Three Dragons are RESOLVED. Every source
 *    consulted agrees with the sheet, and the competing values a previous
 *    revision reported could not be attributed to any of them.
 *  - Win by Kong Replacement is resolved in substance: the sheet and the online
 *    charts book it differently but reach the same 2 faan total.
 *  - Small Four Winds and All Concealed Triplets remain genuinely contested,
 *    with the spread now stated in real numbers rather than "several charts".
 *    The sheet wins the tie, being the primary source.
 *
 * Other sources consulted:
 * - https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring
 * - http://mcgillmahjong.blogspot.com/p/scoring-in-hong-kong-mahjong.html
 * - https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules
 * - https://tilebuddy.app/blog/complete-faan-guide/
 * - http://mahjong.wikidot.com/four-concealed-pungs
 */

import { HK_RULE_SHEET } from './payout'
import type { RulesetScoring, ScoringPattern } from './types'

const SHEET = HK_RULE_SHEET
const WIKIDOT = 'https://mahjong.wikidot.com/rules:hong-kong-old-style-scoring'
const MCGILL = 'http://mcgillmahjong.blogspot.com/p/scoring-in-hong-kong-mahjong.html'
const WIKIPEDIA = 'https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules'
const TILEBUDDY = 'https://tilebuddy.app/blog/complete-faan-guide/'

const PATTERNS: ScoringPattern[] = [
  // ---- Win actions -------------------------------------------------------
  {
    id: 'hk-self-draw',
    name: 'Self-Pick',
    chinese: '自摸',
    romanized: 'zi mo',
    value: 1,
    category: 'situational',
    description: 'You drew your own winning tile from the wall rather than claiming a discard.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-kong-replacement',
    name: 'Win by Kong Replacement',
    chinese: '槓上開花',
    romanized: 'gong soeng hoi fa',
    value: 2,
    category: 'situational',
    replaces: 'hk-self-draw',
    description: 'You declared a kong, drew the replacement tile from the dead end of the wall, and it completed your hand.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA],
      note: 'The bookkeeping differs but the total does not. The supplied sheet scores 2 faan, replacing the 1 for Self-Pick. Wikipedia and the Mahjong Wiki both score 1 faan on top of Self-Pick — also 2 in total. So the payout is agreed; only the way you write it down varies. Either way it is a self-draw, so do not count both.',
    },
  },
  {
    id: 'hk-double-kong-replacement',
    name: 'Double Kong Replacement',
    value: 9,
    category: 'situational',
    replaces: 'hk-self-draw',
    description: 'You called a kong, used the replacement tile to call a second kong, then won on the second replacement tile.',
    beginnerNote: 'Vanishingly rare. Listed so you recognise it if it happens to someone else.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET],
      note: 'Found only on the supplied rule sheet among the sources consulted. Not every table scores this separately.',
    },
  },
  {
    id: 'hk-concealed',
    name: 'Concealed Hand',
    chinese: '門前清',
    romanized: 'mun chin ching',
    value: 1,
    category: 'hand',
    description: 'You took no tiles from other players in order to win.',
    beginnerNote: 'A concealed kong from your own hand does not break this. Claiming any discard does.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-robbing-kong',
    name: 'Robbing the Kong',
    chinese: '搶槓',
    romanized: 'cheung gong',
    value: 1,
    category: 'situational',
    description: 'You won by interrupting another player as they upgraded an exposed pung to a kong, using that tile.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIDOT, MCGILL],
      note: 'The value is agreed at 1 faan, but not every table permits robbing a kong at all. Concealed kongs are usually not robbable.',
    },
  },
  {
    id: 'hk-last-tile',
    name: 'Moon Under The Sea',
    chinese: '海底撈月',
    romanized: 'hoi dai lou yuet',
    value: 1,
    category: 'situational',
    description: 'Your winning tile was the last tile in the wall, or the last discard of the hand.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },

  // ---- Single set type hands --------------------------------------------
  {
    id: 'hk-all-chows',
    name: 'All Sequences',
    chinese: '平和',
    romanized: 'ping wu',
    value: 1,
    category: 'hand',
    description: 'Every set in your hand is a sequence (a run of three).',
    beginnerNote: 'The easiest hand to build, and the cheapest. Most beginners end up here.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-all-pungs',
    name: 'All Triplets',
    chinese: '對對和',
    romanized: 'deui deui wu',
    value: 3,
    category: 'hand',
    description: 'Every set in your hand is a triplet (or a kong). No sequences anywhere.',
    beginnerNote: 'A reliable step up from All Sequences, and it stacks with the flush hands.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-all-concealed-triplets',
    name: 'All Concealed Triplets',
    chinese: '四暗刻',
    romanized: 'sei am hak',
    value: 8,
    category: 'hand',
    replaces: 'hk-all-pungs',
    description: 'Every set is a triplet and none of them were claimed from another player. You may only win by self-pick, or on a discard that completes the pair.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIPEDIA, 'http://mahjong.wikidot.com/four-concealed-pungs'],
      note: 'SOURCES CONFLICT across a wide range. The supplied sheet scores 8 faan and one Hong Kong Old Style table on the Mahjong Wiki agrees; Wikipedia and a second wiki table give 10; a third pays it as an outright limit hand. The sheet is the primary source, so 8 stands, but confirm at a table playing for money.',
    },
  },
  {
    id: 'hk-all-kongs',
    name: 'All Quadruplets',
    chinese: '十八羅漢',
    romanized: 'sap baat lo hon',
    value: 13,
    isLimit: true,
    category: 'hand',
    replaces: 'hk-all-pungs',
    description: 'All four of your sets are kongs.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },

  // ---- Special tile hands ------------------------------------------------
  {
    id: 'hk-dragon-pung',
    name: 'Dragon',
    chinese: '三元牌',
    romanized: 'saam yun paai',
    value: 1,
    category: 'meld',
    repeatable: true,
    description: 'A triplet of dragon tiles — Red, Green or White. Score it once for each dragon triplet you hold.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-little-dragons',
    name: 'Small Three Dragons',
    chinese: '小三元',
    romanized: 'siu saam yuen',
    value: 5,
    category: 'hand',
    replaces: 'hk-dragon-pung',
    description: 'Triplets of two dragons, plus a pair of the third.',
    sourcing: {
      confidence: 'established',
      sources: [SHEET, WIKIDOT, WIKIPEDIA, TILEBUDDY],
      note: 'RESOLVED at 5 faan, replacing the individual dragon triplets. The supplied sheet, Wikipedia and both Hong Kong Old Style tables on the Mahjong Wiki agree. The "2 faan on top of the dragon triplets" reading a previous revision flagged could not be attributed to any source consulted; a third, non-HKOS variant table gives 6.',
    },
  },
  {
    id: 'hk-great-dragons',
    name: 'Big Three Dragons',
    chinese: '大三元',
    romanized: 'daai saam yuen',
    value: 8,
    category: 'hand',
    replaces: 'hk-dragon-pung',
    description: 'Triplets of all three dragons.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIDOT, MCGILL],
      note: 'The supplied sheet and most charts agree on 8 faan. A few rulesets pay it as an outright limit hand.',
    },
  },
  {
    id: 'hk-wind-pung',
    name: 'Round Wind / Seat Wind',
    chinese: '圈風 / 門風',
    romanized: 'huen fung / mun fung',
    value: 1,
    category: 'meld',
    repeatable: true,
    description: 'A triplet of either the current round wind or your own seat wind. If one triplet is both at once, it counts 2 faan.',
    beginnerNote: 'Triplets of the other two winds score nothing on their own.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-little-winds',
    name: 'Small Four Winds',
    chinese: '小四喜',
    romanized: 'siu sei hei',
    value: 6,
    category: 'hand',
    replaces: 'hk-wind-pung',
    description: 'Triplets of three winds, plus a pair of the fourth.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA],
      note: 'SOURCES CONFLICT, and it is a wide one. The supplied sheet scores 6 faan and Wikipedia agrees. The Mahjong Wiki\'s two Hong Kong Old Style tables both give 10, and a third variant table gives 12. The sheet is the primary source here, so 6 stands — but on a table using the higher reading this hand is worth nearly twice as much. Agree it before you play.',
    },
  },
  {
    id: 'hk-great-winds',
    name: 'Big Four Winds',
    chinese: '大四喜',
    romanized: 'daai sei hei',
    value: 13,
    isLimit: true,
    category: 'hand',
    replaces: 'hk-wind-pung',
    description: 'Triplets of all four winds.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-half-flush',
    name: 'Mixed Flush',
    chinese: '混一色',
    romanized: 'wun yat sik',
    value: 3,
    category: 'hand',
    description: 'Your hand contains only one suit, plus honour tiles (winds and dragons).',
    beginnerNote: 'Often the most achievable big hand — the honours give you flexibility a Full Flush does not.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, TILEBUDDY] },
  },
  {
    id: 'hk-full-flush',
    name: 'Full Flush',
    chinese: '清一色',
    romanized: 'ching yat sik',
    value: 7,
    category: 'hand',
    replaces: 'hk-half-flush',
    description: 'Your hand contains only one suit, with no honour tiles at all.',
    sourcing: {
      confidence: 'established',
      sources: [SHEET, WIKIDOT, WIKIPEDIA, TILEBUDDY],
      note: 'RESOLVED. A previous revision flagged a 6-faan reading, which no source consulted actually gives. The supplied sheet, Wikipedia and both Hong Kong Old Style tables on the Mahjong Wiki all score 7. A third, non-HKOS variant table on that wiki gives 9.',
    },
  },
  {
    id: 'hk-mixed-terminals',
    name: 'Mixed Terminals',
    chinese: '混么九',
    romanized: 'wun yiu gau',
    value: 4,
    category: 'hand',
    description: 'Your hand contains only ones, nines and honour tiles. The 3 faan for All Triplets is already included in this value.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, 'https://mahjongo.com/learn/fanlist/all-terminals-and-honors'],
      note: 'Value taken from the supplied rule sheet. Not every Hong Kong chart lists this hand separately.',
    },
  },
  {
    id: 'hk-all-terminals',
    name: 'All Terminals',
    chinese: '清么九',
    romanized: 'ching yiu gau',
    value: 13,
    isLimit: true,
    category: 'hand',
    replaces: 'hk-mixed-terminals',
    description: 'Your hand contains only ones and nines — no honours, no middle numbers.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, WIKIPEDIA] },
  },
  {
    id: 'hk-all-honours',
    name: 'All Honours',
    chinese: '字一色',
    romanized: 'ji yat sik',
    value: 10,
    category: 'hand',
    replaces: 'hk-mixed-terminals',
    description: 'Your hand contains only honour tiles — winds and dragons, nothing suited. The 3 faan for All Triplets is already included.',
    sourcing: {
      confidence: 'established',
      sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA],
      note: 'RESOLVED at 10 faan. The supplied sheet, Wikipedia and both Hong Kong Old Style tables on the Mahjong Wiki agree. The 13-faan limit-hand reading a previous revision flagged could not be attributed to any source consulted, though some rulesets outside Hong Kong Old Style do pay this as a limit hand.',
    },
  },

  // ---- Flowers and seasons ----------------------------------------------
  {
    id: 'hk-no-flowers',
    name: 'No Flowers or Seasons',
    value: 1,
    category: 'bonus',
    description: 'You finished the hand holding no flower or season tiles at all.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIDOT],
      note: 'On the supplied sheet. Not every table scores an empty flower rack.',
    },
  },
  {
    id: 'hk-own-flower',
    name: 'Seat Flower or Season',
    chinese: '正花',
    romanized: 'jing fa',
    value: 1,
    category: 'bonus',
    repeatable: true,
    description: 'A flower or season numbered to match your seat: 1 = East, 2 = South, 3 = West, 4 = North. One faan for each.',
    beginnerNote: 'Set flowers aside face up as you draw them and take a replacement tile immediately.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT] },
  },
  {
    id: 'hk-all-flowers',
    name: 'All Flowers or All Seasons',
    value: 2,
    category: 'bonus',
    description: 'You hold either all four flowers or all four seasons.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET],
      note: 'Value from the supplied rule sheet; other tables score this differently or not at all.',
    },
  },
  {
    id: 'hk-seven-flowers',
    name: 'Seven Flowers',
    value: 3,
    category: 'bonus',
    description: 'You may choose to win immediately on declaring your seventh flower or season tile.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET],
      note: 'Found only on the supplied rule sheet among the sources consulted.',
    },
  },
  {
    id: 'hk-eight-flowers',
    name: 'Eight Flowers',
    value: 8,
    category: 'bonus',
    description: 'You may choose to win immediately on declaring your eighth flower or season tile — every bonus tile in the set.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET],
      note: 'Found only on the supplied rule sheet among the sources consulted.',
    },
  },

  // ---- Special hands -----------------------------------------------------
  {
    id: 'hk-heavenly',
    name: 'Blessing of Heaven',
    chinese: '天和',
    romanized: 'tin wo',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'As dealer, your opening hand is already complete before you discard anything.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-earthly',
    name: 'Blessing of Earth',
    chinese: '地和',
    romanized: 'dei wo',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: "As a non-dealer, you win using the dealer's very first discard.",
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL] },
  },
  {
    id: 'hk-blessing-of-man',
    name: 'Blessing of Man',
    chinese: '人和',
    romanized: 'jan wo',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'As a non-dealer, you win on your very first turn with a self-pick.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET],
      note: 'Definitions of this hand differ widely between rulesets. The description here is the supplied sheet\'s.',
    },
  },
  {
    id: 'hk-nine-gates',
    name: 'Nine Gates',
    chinese: '九蓮寶燈',
    romanized: 'gau lin bou dang',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'A hand of 1-1-1 2 3 4 5 6 7 8 9-9-9 in a single suit, plus a fourteenth tile of that same suit.',
    beginnerNote: 'Famous, spectacular, and almost never happens. Do not chase it.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-thirteen-orphans',
    name: 'Thirteen Orphans',
    chinese: '十三么',
    romanized: 'sap saam yiu',
    value: 13,
    isLimit: true,
    category: 'limit',
    description: 'One of each one, nine, wind and dragon, plus a fourteenth tile matching any one of them.',
    sourcing: { confidence: 'established', sources: [SHEET, WIKIDOT, MCGILL, WIKIPEDIA] },
  },
  {
    id: 'hk-seven-pairs',
    name: 'Seven Pairs',
    chinese: '七對子',
    romanized: 'cat deui zi',
    value: 4,
    category: 'hand',
    description: 'Seven different pairs instead of the usual four sets and a pair. Stacks with All Honours, Mixed Flush and Full Flush.',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, 'https://mahjongo.com/learn/fanlist/seven-pairs'],
      note: 'The supplied rule sheet marks this as "only played in certain variants". Confirm your table plays it at all before counting on it.',
    },
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
      sources: [SHEET, WIKIDOT, 'https://mahjongcompare.com/styles/hong-kong'],
      note: 'The supplied rule sheet confirms Hong Kong play usually sets a minimum but does not fix a number. Three faan is the most common; casual tables drop to 1 or 0 (a "chicken hand" win), competitive play sometimes uses 5.',
    },
  },
  limit: {
    common: 13,
    range: '8–13 faan',
    sourcing: {
      confidence: 'varies',
      sources: [SHEET, WIKIPEDIA],
      note: 'The supplied sheet\'s payment table runs to "13+", so 13 is the ceiling here. Tables that want lower stakes cap at 8 or 10 instead.',
    },
  },
  patterns: PATTERNS,
}
