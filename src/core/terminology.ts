/**
 * Terminology mapping table (spec §5, §7.1).
 *
 * Every user-facing game term resolves through this table. No component may
 * hardcode "Pung" or "Bamboo" — it asks for the term key and the current
 * terminology setting decides what appears on screen.
 *
 * SOURCING (spec §8): romanization is a known-messy area. Cantonese has several
 * competing schemes (Jyutping, Yale, and the ad-hoc spellings actually used at
 * HK tables), and Mandarin terms differ between mainland and Taiwanese usage.
 * We use the spellings most commonly seen in English-language mahjong material
 * and mark the table `varies`. Characters are far more stable than romanization.
 *
 * Sources consulted:
 * - https://www.mahjonggame.hk/learn/hk-mahjong/glossary
 * - https://mcgillmahjong.blogspot.com/p/exhaustive-glossary-of-mahjong-terms.html
 * - https://mahjongcalculators.com/glossary/
 * - https://heymahjong.com/mahjong-for-beginners/chinese-mahjong-terminology/
 */

import type { Sourced } from './types'

/** Language the player wants terms displayed in. */
export type TermLanguage = 'en' | 'cantonese' | 'mandarin'

/** Romanized spelling vs. Chinese characters. Ignored when language is English. */
export type TermScript = 'romanized' | 'characters'

export interface TerminologySetting {
  language: TermLanguage
  script: TermScript
}

export const DEFAULT_TERMINOLOGY: TerminologySetting = {
  language: 'en',
  script: 'romanized',
}

interface Localized {
  romanized: string
  characters: string
}

export interface TermEntry {
  /** Stable lookup key used throughout the app. */
  key: string
  en: string
  cantonese: Localized
  mandarin: Localized
  /** One-line beginner gloss. Always English — it explains, it doesn't name. */
  gloss?: string
}

/**
 * The mapping table. Keys are referenced from tile data, meld rules and
 * scoring patterns, so a term only ever has to be spelled once.
 */
export const TERMS: Record<string, TermEntry> = {
  // ---- Actions -----------------------------------------------------------
  chow: {
    key: 'chow',
    en: 'Chow',
    // HK tables typically call 上 (soeng); Mandarin uses 吃 (chī).
    cantonese: { romanized: 'soeng', characters: '上' },
    mandarin: { romanized: 'chī', characters: '吃' },
    gloss: 'Three tiles in a row, same suit — like 3-4-5 dots.',
  },
  pung: {
    key: 'pung',
    en: 'Pung',
    cantonese: { romanized: 'pung', characters: '碰' },
    mandarin: { romanized: 'pèng', characters: '碰' },
    gloss: 'Three identical tiles.',
  },
  kong: {
    key: 'kong',
    en: 'Kong',
    cantonese: { romanized: 'gong', characters: '槓' },
    mandarin: { romanized: 'gàng', characters: '槓' },
    gloss: 'Four identical tiles.',
  },
  pair: {
    key: 'pair',
    en: 'Pair',
    cantonese: { romanized: 'ngaan', characters: '眼' },
    mandarin: { romanized: 'duìzi', characters: '對子' },
    gloss: 'Two identical tiles — the "eyes" of your hand.',
  },
  win: {
    key: 'win',
    en: 'Mahjong!',
    cantonese: { romanized: 'sik wu', characters: '食糊' },
    mandarin: { romanized: 'hú', characters: '胡' },
    gloss: 'The call you make when your hand is complete.',
  },
  selfDraw: {
    key: 'selfDraw',
    en: 'Self-draw',
    cantonese: { romanized: 'zi mo', characters: '自摸' },
    mandarin: { romanized: 'zì mō', characters: '自摸' },
    gloss: 'You completed your hand with a tile you drew yourself.',
  },
  dealIn: {
    key: 'dealIn',
    en: 'Deal in',
    cantonese: { romanized: 'ceot cung', characters: '出銃' },
    mandarin: { romanized: 'diǎn pào', characters: '點炮' },
    gloss: 'You discarded the tile someone else won on.',
  },
  chickenHand: {
    key: 'chickenHand',
    en: 'Chicken hand',
    cantonese: { romanized: 'gaai wu', characters: '雞糊' },
    mandarin: { romanized: 'jī hú', characters: '雞胡' },
    gloss: 'A winning hand worth zero faan. Only playable where the table has no minimum.',
  },
  draw: {
    key: 'draw',
    en: 'Draw / no winner',
    cantonese: { romanized: 'wong pai', characters: '流局' },
    mandarin: { romanized: 'liú jú', characters: '流局' },
    gloss: 'The wall ran out before anyone won.',
  },

  // ---- Suits -------------------------------------------------------------
  dots: {
    key: 'dots',
    en: 'Dots',
    cantonese: { romanized: 'tung', characters: '筒' },
    mandarin: { romanized: 'tǒng', characters: '筒' },
    gloss: 'Circles. Count the circles to get the number.',
  },
  bamboo: {
    key: 'bamboo',
    en: 'Bamboo',
    cantonese: { romanized: 'sok', characters: '索' },
    mandarin: { romanized: 'tiáo', characters: '條' },
    gloss: 'Sticks. Count the sticks — except 1 Bamboo, which is a bird.',
  },
  characters: {
    key: 'characters',
    en: 'Characters',
    cantonese: { romanized: 'maan', characters: '萬' },
    mandarin: { romanized: 'wàn', characters: '萬' },
    gloss: 'Chinese numeral on top, 萬 (ten thousand) underneath.',
  },

  // ---- Honours -----------------------------------------------------------
  winds: {
    key: 'winds',
    en: 'Winds',
    cantonese: { romanized: 'fung', characters: '風' },
    mandarin: { romanized: 'fēng', characters: '風' },
  },
  dragons: {
    key: 'dragons',
    en: 'Dragons',
    cantonese: { romanized: 'jin paai', characters: '箭牌' },
    mandarin: { romanized: 'jiàn pái', characters: '箭牌' },
  },
  east: {
    key: 'east',
    en: 'East',
    cantonese: { romanized: 'dung', characters: '東' },
    mandarin: { romanized: 'dōng', characters: '東' },
  },
  south: {
    key: 'south',
    en: 'South',
    cantonese: { romanized: 'naam', characters: '南' },
    mandarin: { romanized: 'nán', characters: '南' },
  },
  west: {
    key: 'west',
    en: 'West',
    cantonese: { romanized: 'sai', characters: '西' },
    mandarin: { romanized: 'xī', characters: '西' },
  },
  north: {
    key: 'north',
    en: 'North',
    cantonese: { romanized: 'bak', characters: '北' },
    mandarin: { romanized: 'běi', characters: '北' },
  },
  redDragon: {
    key: 'redDragon',
    en: 'Red Dragon',
    cantonese: { romanized: 'hung zung', characters: '紅中' },
    mandarin: { romanized: 'hóng zhōng', characters: '紅中' },
    gloss: 'A red 中. Sometimes just called "red" or "centre".',
  },
  greenDragon: {
    key: 'greenDragon',
    en: 'Green Dragon',
    cantonese: { romanized: 'faat coi', characters: '發財' },
    mandarin: { romanized: 'fā cái', characters: '發財' },
    gloss: 'A green 發. Often called "the green" or "prosperity".',
  },
  whiteDragon: {
    key: 'whiteDragon',
    en: 'White Dragon',
    cantonese: { romanized: 'baak baan', characters: '白板' },
    mandarin: { romanized: 'bái bǎn', characters: '白板' },
    gloss: 'A blank tile, or one with a blue frame. Also called "soap".',
  },

  // ---- Bonus tiles -------------------------------------------------------
  flowers: {
    key: 'flowers',
    en: 'Flowers',
    cantonese: { romanized: 'faa', characters: '花' },
    mandarin: { romanized: 'huā', characters: '花' },
    gloss: 'Bonus tiles. Set them aside and draw a replacement.',
  },
  seasons: {
    key: 'seasons',
    en: 'Seasons',
    cantonese: { romanized: 'gwai', characters: '季' },
    mandarin: { romanized: 'jì', characters: '季' },
    gloss: 'Bonus tiles. Set them aside and draw a replacement.',
  },

  // ---- Scoring units -----------------------------------------------------
  faan: {
    key: 'faan',
    en: 'Faan',
    cantonese: { romanized: 'faan', characters: '番' },
    mandarin: { romanized: 'fān', characters: '番' },
    gloss: 'The Hong Kong scoring unit. Each faan roughly doubles the payout.',
  },
  tai: {
    key: 'tai',
    en: 'Tai',
    cantonese: { romanized: 'toi', characters: '台' },
    mandarin: { romanized: 'tái', characters: '台' },
    gloss: 'The Taiwanese scoring unit. Tai add up, then multiply a base stake.',
  },
  concealed: {
    key: 'concealed',
    en: 'Concealed',
    cantonese: { romanized: 'mun cing', characters: '門清' },
    mandarin: { romanized: 'mén qīng', characters: '門清' },
    gloss: 'You never claimed a tile from another player.',
  },
  dealer: {
    key: 'dealer',
    en: 'Dealer',
    cantonese: { romanized: 'zong', characters: '莊' },
    mandarin: { romanized: 'zhuāng', characters: '莊' },
    gloss: 'The East seat. Deals the hand and scores differently.',
  },
}

/** Provenance for the terminology table as a whole. */
export const TERMINOLOGY_SOURCING: Sourced = {
  confidence: 'varies',
  sources: [
    'https://www.mahjonggame.hk/learn/hk-mahjong/glossary',
    'https://mcgillmahjong.blogspot.com/p/exhaustive-glossary-of-mahjong-terms.html',
    'https://mahjongcalculators.com/glossary/',
    'Hong Kong Mahjong Rule Sheet v1.0 (3 April 2025) by /u/danma — PDF supplied by the project owner',
  ],
  note: 'The Cantonese readings for chow (soeng), pung, gong, zi mo, sik wu, gaai wu and the three suits (tung zi, sok zi, maan zi) are confirmed by the rule sheet supplied by the project owner. Elsewhere, romanization schemes differ (Jyutping vs. Yale vs. table shorthand) and some terms differ between mainland and Taiwanese Mandarin. Characters are the stable form.',
}

/**
 * Resolve a term key to display text for the current setting.
 * Falls back to the English name if a key is unknown, so a missing entry
 * degrades to something readable rather than blank.
 */
export function term(key: string, setting: TerminologySetting = DEFAULT_TERMINOLOGY): string {
  const entry = TERMS[key]
  if (!entry) return key
  if (setting.language === 'en') return entry.en
  return entry[setting.language][setting.script]
}

/**
 * Term plus its English name, for headings where the player still needs the
 * word their table uses AND the word this app's instructions use.
 * Returns a single string when the setting is already English.
 */
export function termWithEnglish(key: string, setting: TerminologySetting): string {
  const primary = term(key, setting)
  const entry = TERMS[key]
  if (!entry || setting.language === 'en' || primary === entry.en) return primary
  return `${primary} (${entry.en})`
}

export function gloss(key: string): string | undefined {
  return TERMS[key]?.gloss
}
