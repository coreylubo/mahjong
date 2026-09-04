/**
 * Taiwanese (16-tile) scoring, in tai (台).
 *
 * ⚠️ SPEC §8 APPLIES HERE. Nothing in this file is written from recall.
 *
 * WHICH SCALE THIS FILE HOLDS
 * ---------------------------
 * Taiwanese tai values vary far more than Hong Kong faan, and the variation is
 * not random noise — it splits into recognisable *scales*. Three appear in the
 * sources consulted:
 *
 *  1. The mainstream 1/2/4/8/16/24 scale, used by the IGS column on the Mahjong
 *     Wiki and independently by the Traditional-Chinese chart at mj888. THIS IS
 *     THE SCALE THIS FILE HOLDS, because it is the one two independent sources
 *     agree on and the one most Taiwanese tables and apps use.
 *  2. The LA Mahjong League "House Rules" scale, which shares the same hand
 *     list but roughly quadruples the top end (Full Flush 32, Tianhu 64). It is
 *     explicitly self-described house rules — "Every family has their own house
 *     rules and these are ours" — so it is recorded in the notes below as a
 *     named house variant, NOT treated as a competing mainstream reading.
 *  3. A much larger scale, in which winning itself is worth 2 tai and a Full
 *     Flush is worth 40, used by the Four Winds rule collection and by the
 *     rec.games.mahjong "tai values" post. Values from these two are cited only
 *     for patterns where their number happens to match this file's scale (the
 *     1-tai items); they are NOT cited as support for any higher value.
 *
 * A previous revision of this file cited the Four Winds page and the usenet
 * crib sheet for values those pages do not actually give (Full Flush 8, Half
 * Flush 4, Five Concealed Pungs 8). Those citations have been corrected against
 * the fetched pages rather than carried forward.
 *
 * `confidence: 'established'` here means the mainstream-scale sources agree.
 * Where the LA house value differs it is still stated in the note, so a player
 * at an LA-rules table is never shown a number without the alternative.
 *
 * Sources consulted:
 * - https://www.lamahjongleague.com/house-rules (primary — league rule guide)
 * - http://mahjong.wikidot.com/rules:taiwanese-scoring (IGS and LA columns)
 * - https://mj888.cc/en-us/taiwanese-scoring-rules/
 * - https://4windsmj.com/kb/rules/taiwanese/rules05.htm (larger scale — see above)
 * - https://rec.games.mahjong.narkive.com/ax54rtqt/taiwanese-mahjong-tai-values (larger scale)
 * - https://rec.games.mahjong.narkive.com/waHyP5Gb/taiwan-rules-crib-sheet (usenet discussion)
 * - https://mahjmahj.co/styles/taiwanese-mahjong
 */

import type { RulesetScoring, ScoringPattern } from './types'

/**
 * The LA Mahjong League's published house rules, supplied by the project owner.
 * A two-page rule guide served as images; the values below are transcribed from
 * those images. A named league that actually plays these at a real table, so a
 * strong prescriptive source — but for its own house scale, by its own account.
 */
const LAMJ = 'https://www.lamahjongleague.com/house-rules'
const WIKIDOT = 'http://mahjong.wikidot.com/rules:taiwanese-scoring'
const MJ888 = 'https://mj888.cc/en-us/taiwanese-scoring-rules/'
const FOURWINDS = 'https://4windsmj.com/kb/rules/taiwanese/rules05.htm'
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
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, FOURWINDS] },
  },
  {
    id: 'tw-concealed',
    name: 'Concealed hand',
    chinese: '門清',
    romanized: 'mén qīng',
    value: 1,
    category: 'hand',
    description: 'No open melds — you never claimed a tile from another player.',
    beginnerNote: 'Concealed plus self-draw is worth 3 tai as a package, not 2 — see Concealed Self-Draw below.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, CRIB, FOURWINDS] },
  },
  {
    id: 'tw-concealed-self-draw',
    name: 'Concealed Self-Draw',
    chinese: '門清自摸',
    romanized: 'mén qīng zì mō',
    value: 3,
    category: 'hand',
    replaces: 'tw-concealed',
    description: 'A fully concealed hand won on your own draw. Worth 3 tai as a package.',
    beginnerNote: 'Do not also count Self-draw and Concealed hand — this 3 tai replaces both. The LA sheet calls it 一摸三, "one draw, three".',
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, CRIB] },
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
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, CRIB] },
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
      sources: [WIKIDOT, MJ888, CRIB, LAMJ],
      note: 'SOURCES CONFLICT. 2 tai per repeat is the common reading — both the Mahjong Wiki and mj888 give the payout as Tai + 2C + 1, where C is the number of consecutive dealer wins. The usenet crib sheet instead gives 1 tai per extension. The LA league does not use tai for this at all: it escalates the stake itself, +/-3 points on the first repeat, +/-5 on the second, and so on. Agree this one before you deal — it is the biggest swing in the game.',
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
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, FOURWINDS],
      note: 'The LA league and the Four Winds collection score 1 tai for EVERY flower, not only the one matching your seat. Both readings give the same 1 tai per qualifying flower; they differ only in which flowers qualify.',
    },
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
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, FOURWINDS] },
  },
  {
    id: 'tw-seat-wind',
    name: 'Seat wind pung',
    chinese: '門風',
    romanized: 'mén fēng',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of your own seat wind.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ],
      note: 'The value is agreed at 1 tai, but not which winds qualify. The Mahjong Wiki and the LA league score 1 tai for a pung of ANY wind; other charts restrict it to your seat wind and the round wind, as listed here. On an any-wind table a hand with three unrelated wind pungs scores 3 tai rather than 0.',
    },
  },
  {
    id: 'tw-round-wind',
    name: 'Round wind pung',
    chinese: '圈風',
    romanized: 'quān fēng',
    value: 1,
    category: 'meld',
    description: 'A pung or kong of the current round wind.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ],
      note: 'Same split as Seat wind pung: the Mahjong Wiki and the LA league score any wind pung 1 tai, other charts only the seat and round winds.',
    },
  },
  {
    id: 'tw-kong-replacement',
    name: 'Win on a kong replacement',
    chinese: '槓上開花',
    romanized: 'gàng shàng kāi huā',
    value: 1,
    category: 'situational',
    description: 'You declared a kong, drew the replacement, and it completed your hand.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ],
      note: 'SOURCES CONFLICT: the IGS chart scores this 2 tai, the LA league 1. Some tables extend it to a flower replacement tile as well as a kong replacement.',
    },
  },
  {
    id: 'tw-last-tile',
    name: 'Win on the last tile',
    chinese: '海底撈月',
    romanized: 'hǎi dǐ lāo yuè',
    value: 1,
    category: 'situational',
    description: 'You won on the final tile of the wall, or the final discard.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, FOURWINDS] },
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
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, FOURWINDS],
      note: 'Only an added (exposed) kong can be robbed. A concealed kong cannot.',
    },
  },
  {
    id: 'tw-single-wait',
    name: 'Single wait',
    chinese: '獨聽',
    romanized: 'dú tīng',
    value: 1,
    category: 'situational',
    description: 'When you won, exactly one tile could have completed your hand.',
    beginnerNote: 'An edge wait (1-2 waiting on 3), a closed wait (4-6 waiting on 5) or waiting on the pair all count.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ],
      note: 'SOURCES CONFLICT: the Mahjong Wiki lists 1 tai for both its columns, but the LA league\'s own rule guide prints this under its 2-point section. Treat 1 as the common reading and 2 as the LA value.',
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
    description: 'Five chows and a suited pair, with no honour tiles and no pungs or kongs.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, MJ888],
      note: 'The value is agreed at 2 tai across all three sources; the qualifying conditions are not. All require five chows and a non-honour pair. The Mahjong Wiki adds that the win must not be a single-tile wait nor self-drawn, and notes some tables also require no flowers. The LA league instead pays a bonus on top: +1 per flower, or +3 for no flowers.',
    },
  },
  {
    id: 'tw-concealed-kong',
    name: 'Concealed kong',
    chinese: '暗槓',
    romanized: 'àn gàng',
    value: 2,
    category: 'meld',
    repeatable: true,
    description: 'A kong you completed from your own draws and kept face down. 2 tai each.',
    beginnerNote: 'An exposed kong — one made by claiming a discard — is worth 1 tai, not 2. Do not count both for the same kong.',
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, FOURWINDS] },
  },
  {
    id: 'tw-three-concealed',
    name: 'Three Concealed Pungs',
    chinese: '三暗刻',
    romanized: 'sān àn kè',
    value: 2,
    category: 'hand',
    description: 'Three pungs made without claiming a tile. Concealed kongs count toward the three.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888, CRIB],
      note: 'The LA league scores this 8 tai on its house scale.',
    },
  },
  {
    id: 'tw-no-honours-no-flowers',
    name: 'No honours, no flowers',
    chinese: '無字無花',
    romanized: 'wú zì wú huā',
    value: 2,
    category: 'hand',
    description: 'You won with no winds, no dragons and no flowers at all.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ, FOURWINDS],
      note: 'The IGS chart scores 2 tai, the LA league and the Four Winds collection 3. The LA sheet adds that the bonus is lost if your pair is a wind or dragon.',
    },
  },
  {
    id: 'tw-all-exposed',
    name: 'All melds claimed',
    chinese: '全求人',
    romanized: 'quán qiú rén',
    value: 1,
    category: 'hand',
    description: 'Every set was claimed from other players, and you win off a discard too. Only the pair is your own.',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, LAMJ],
      note: 'SOURCES CONFLICT. The Mahjong Wiki gives 1 tai on both its IGS and LA columns, and the LA rule guide treats it as a +1 add-on to a single wait. A previous revision of this file carried 2 tai, and 4 also appears on some charts; neither could be confirmed against a source that was actually reachable. Treat 1 as the best-supported value.',
    },
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
    sourcing: { confidence: 'established', sources: [WIKIDOT, LAMJ, MJ888] },
  },
  {
    id: 'tw-half-flush',
    name: 'Half Flush',
    chinese: '混一色',
    romanized: 'hùn yī sè',
    value: 4,
    category: 'hand',
    description: 'One suit plus honour tiles.',
    beginnerNote: 'You can qualify with as little as one suited set and the rest winds and dragons.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'The LA league scores this 8 tai on its house scale.',
    },
  },
  {
    id: 'tw-little-dragons',
    name: 'Little Three Dragons',
    chinese: '小三元',
    romanized: 'xiǎo sān yuán',
    value: 4,
    category: 'hand',
    description: 'Pungs of two dragons, plus a pair of the third.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, CRIB],
      note: 'The two dragon pungs are absorbed into this 4 tai — do not also count them individually.',
    },
  },
  {
    id: 'tw-four-concealed',
    name: 'Four Concealed Pungs',
    chinese: '四暗刻',
    romanized: 'sì àn kè',
    value: 5,
    category: 'hand',
    replaces: 'tw-three-concealed',
    description: 'Four pungs made without claiming a tile. Concealed kongs count toward the four.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'Replaces Three Concealed Pungs rather than adding to it. The LA league scores this 16 tai on its house scale.',
    },
  },

  // ---- 8 tai -----------------------------------------------------------
  {
    id: 'tw-full-flush',
    name: 'Full Flush',
    chinese: '清一色',
    romanized: 'qīng yī sè',
    value: 8,
    category: 'hand',
    replaces: 'tw-half-flush',
    description: 'One suit only, no honour tiles.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'Replaces Half Flush rather than adding to it. The LA league scores this 32 tai on its house scale — the largest single gap between the two scales.',
    },
  },
  {
    id: 'tw-great-dragons',
    name: 'Great Three Dragons',
    chinese: '大三元',
    romanized: 'dà sān yuán',
    value: 8,
    category: 'hand',
    replaces: 'tw-little-dragons',
    description: 'Pungs or kongs of all three dragons.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ],
      note: 'Replaces Little Three Dragons and the individual dragon pungs rather than adding to them.',
    },
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
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, MJ888],
      note: 'The wind pungs are absorbed into this 8 tai — do not also count them individually.',
    },
  },
  {
    id: 'tw-five-concealed',
    name: 'Five Concealed Pungs',
    chinese: '五暗刻',
    romanized: 'wǔ àn kè',
    value: 8,
    category: 'hand',
    replaces: 'tw-four-concealed',
    description: 'All five pungs made without claiming a single tile. Concealed kongs count toward the five.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'Replaces Four Concealed Pungs rather than adding to it, and the LA sheet adds that it does not stack with All Pungs either. The LA league scores it 32 tai on its house scale.',
    },
  },
  {
    id: 'tw-all-honours',
    name: 'All Honours',
    chinese: '字一色',
    romanized: 'zì yī sè',
    value: 8,
    category: 'hand',
    description: 'Winds and dragons only, no suited tiles.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'A previous revision of this file carried 16 tai, which matches neither scale. The IGS chart and mj888 both give 8; the LA league scores it 32 on its house scale.',
    },
  },

  // ---- 16 tai and up ---------------------------------------------------
  {
    id: 'tw-great-winds',
    name: 'Great Four Winds',
    chinese: '大四喜',
    romanized: 'dà sì xǐ',
    value: 16,
    category: 'limit',
    replaces: 'tw-little-winds',
    description: 'Pungs or kongs of all four winds.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, MJ888],
      note: 'All three sources agree at 16 tai, including the LA house scale. Replaces Little Four Winds rather than adding to it.',
    },
  },
  {
    id: 'tw-earthly',
    name: 'Earthly Hand',
    chinese: '地胡',
    romanized: 'dì hú',
    value: 16,
    category: 'limit',
    description: 'A non-dealer completes their hand on their very first draw, before discarding anything.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, LAMJ, MJ888],
      note: 'All three sources agree at 16 tai, including the LA house scale. It absorbs the self-draw and concealed-hand bonuses rather than adding to them.',
    },
  },
  {
    id: 'tw-heavenly',
    name: 'Heavenly Hand',
    chinese: '天胡',
    romanized: 'tiān hú',
    value: 24,
    category: 'limit',
    description: 'The dealer completes their hand on the opening deal, before discarding anything.',
    beginnerNote: 'Only the dealer can score this. The non-dealer equivalent is the Earthly Hand, so the two can never both apply.',
    sourcing: {
      confidence: 'established',
      sources: [WIKIDOT, MJ888],
      note: 'A previous revision of this file carried 16 tai. The IGS chart and mj888 both give 24; the LA league scores it 64 on its house scale, the highest value on either scale. It absorbs the self-draw and concealed-hand bonuses rather than adding to them.',
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
      sources: [WIKIDOT, MAHJMAHJ, LAMJ],
      note: 'Many Taiwanese tables have no minimum at all — you can win on a bare base score, and neither the Mahjong Wiki nor the LA league rule guide states one. Others require 1 or 3 tai. This is set by the table, not the ruleset.',
    },
  },
  limit: {
    common: 24,
    range: 'usually uncapped',
    sourcing: {
      confidence: 'varies',
      sources: [WIKIDOT, MJ888, LAMJ],
      note: 'Taiwanese play normally has no ceiling — scores are simply summed. The 24 here is not a cap but the highest single pattern on this file\'s scale (Heavenly Hand); a hand combining patterns can exceed it. On the LA house scale the equivalent figure is 64. Where a table does cap, it is a table agreement rather than a rule.',
    },
  },
  patterns: PATTERNS,
}
