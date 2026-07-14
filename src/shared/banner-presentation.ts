export const BANNER_TEXT_TONE_VALUES = ['starlight', 'obsidian', 'cobalt', 'ruby', 'emerald', 'violet', 'orange'] as const
export type BannerTextTone = (typeof BANNER_TEXT_TONE_VALUES)[number]

export const BANNER_TEXT_LABELS: Record<BannerTextTone, string> = {
  starlight: 'High-contrast light',
  obsidian: 'Obsidian',
  cobalt: 'Cobalt blue',
  ruby: 'Ruby red',
  emerald: 'Emerald green',
  violet: 'Royal violet',
  orange: 'Vivid orange',
}

export const BANNER_TEXT_CLASSES: Record<BannerTextTone, string> = {
  starlight: 'text-[#f8fafc]',
  obsidian: 'text-[#090b10]',
  cobalt: 'text-[#064cff]',
  ruby: 'text-[#c8102e]',
  emerald: 'text-[#007a53]',
  violet: 'text-[#5b21b6]',
  orange: 'text-[#ff6b00]',
}

export const BANNER_BUTTON_STYLE_VALUES = ['obsidian', 'cobalt', 'ruby', 'emerald', 'violet', 'orange', 'outline'] as const
export type BannerButtonStyle = (typeof BANNER_BUTTON_STYLE_VALUES)[number]

export const BANNER_BUTTON_LABELS: Record<BannerButtonStyle, string> = {
  obsidian: 'Obsidian',
  cobalt: 'Cobalt blue',
  ruby: 'Ruby red',
  emerald: 'Emerald green',
  violet: 'Royal violet',
  orange: 'Vivid orange',
  outline: 'Adaptive outline',
}

export const BANNER_BUTTON_CLASSES: Record<Exclude<BannerButtonStyle, 'outline'>, string> = {
  obsidian: 'bg-[#090b10] text-white',
  cobalt: 'bg-[#064cff] text-white',
  ruby: 'bg-[#c8102e] text-white',
  emerald: 'bg-[#007a53] text-white',
  violet: 'bg-[#5b21b6] text-white',
  orange: 'bg-[#ff6b00] text-[#180b00]',
}

export const BANNER_TITLE_STYLE_VALUES = ['modern', 'editorial', 'clean', 'statement'] as const
export type BannerTitleStyle = (typeof BANNER_TITLE_STYLE_VALUES)[number]

export const BANNER_TITLE_STYLE_LABELS: Record<BannerTitleStyle, string> = {
  modern: 'Commerce bold',
  editorial: 'Editorial serif',
  clean: 'Clean sans',
  statement: 'Campaign caps',
}

export const BANNER_TITLE_STYLE_CLASSES: Record<BannerTitleStyle, string> = {
  modern: 'font-display font-black tracking-[-0.045em]',
  editorial: 'font-serif font-bold tracking-[-0.035em]',
  clean: 'font-sans font-bold tracking-[-0.025em]',
  statement: 'font-sans font-black uppercase tracking-[0.015em]',
}

const LEGACY_TEXT_TONES: Record<string, BannerTextTone> = {
  light: 'starlight',
  white: 'starlight',
  ice: 'starlight',
  dark: 'obsidian',
  carbon: 'obsidian',
  brand: 'cobalt',
  crimson: 'ruby',
  gold: 'orange',
  amber: 'orange',
  mint: 'emerald',
}

const LEGACY_BUTTON_STYLES: Record<string, BannerButtonStyle> = {
  light: 'obsidian',
  dark: 'obsidian',
  carbon: 'obsidian',
  brand: 'cobalt',
  crimson: 'ruby',
  gold: 'orange',
  amber: 'orange',
  mint: 'emerald',
}

export function normalizeBannerTextTone(value: string | null | undefined): BannerTextTone {
  if (BANNER_TEXT_TONE_VALUES.includes(value as BannerTextTone)) return value as BannerTextTone
  return LEGACY_TEXT_TONES[value ?? ''] ?? 'starlight'
}

export function normalizeBannerButtonStyle(value: string | null | undefined): BannerButtonStyle {
  if (BANNER_BUTTON_STYLE_VALUES.includes(value as BannerButtonStyle)) return value as BannerButtonStyle
  return LEGACY_BUTTON_STYLES[value ?? ''] ?? 'obsidian'
}

export function normalizeBannerTitleStyle(value: string | null | undefined): BannerTitleStyle {
  return BANNER_TITLE_STYLE_VALUES.includes(value as BannerTitleStyle) ? value as BannerTitleStyle : 'modern'
}

export function bannerToneUsesLightBackdrop(tone: BannerTextTone) {
  return tone === 'obsidian' || tone === 'cobalt' || tone === 'ruby' || tone === 'emerald' || tone === 'violet'
}
