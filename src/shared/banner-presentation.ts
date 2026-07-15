import type { CSSProperties } from 'react'

export const BANNER_TEXT_TONE_VALUES = [
  'white',
  'black',
  'electric-blue',
  'signal-red',
  'performance-green',
  'luxury-gold',
  'beauty-magenta',
  'gaming-cyan',
] as const
export type BannerTextTone = (typeof BANNER_TEXT_TONE_VALUES)[number]

export const BANNER_TEXT_TONE_OPTION_VALUES = [
  'white',
  'black',
  'electric-blue',
  'signal-red',
  'performance-green',
  'luxury-gold',
] as const satisfies readonly BannerTextTone[]

export const BANNER_TEXT_LABELS: Record<BannerTextTone, string> = {
  white: 'White',
  black: 'Black',
  'electric-blue': 'Brand blue',
  'signal-red': 'Crimson',
  'performance-green': 'Emerald',
  'luxury-gold': 'Amber',
  'beauty-magenta': 'Magenta',
  'gaming-cyan': 'Cyan',
}

export const BANNER_TEXT_CLASSES: Record<BannerTextTone, string> = {
  white: 'text-white',
  black: 'text-[#090b10]',
  'electric-blue': 'text-[#0b63f6]',
  'signal-red': 'text-[#dc1638]',
  'performance-green': 'text-[#008d57]',
  'luxury-gold': 'text-[#e7a600]',
  'beauty-magenta': 'text-[#d81b76]',
  'gaming-cyan': 'text-[#009ac5]',
}

export const BANNER_TEXT_SWATCHES: Record<BannerTextTone, string> = {
  white: '#ffffff',
  black: '#090b10',
  'electric-blue': '#0b63f6',
  'signal-red': '#dc1638',
  'performance-green': '#008d57',
  'luxury-gold': '#e7a600',
  'beauty-magenta': '#d81b76',
  'gaming-cyan': '#009ac5',
}

export const BANNER_BUTTON_STYLE_VALUES = [
  'solid-black',
  'solid-white',
  'brand-blue',
  'signal-red',
  'luxury-gold',
  'outline-white',
  'outline-black',
  'soft-white',
  'soft-black',
  'editorial-white',
  'editorial-black',
  'minimal-white',
] as const
export type BannerButtonStyle = (typeof BANNER_BUTTON_STYLE_VALUES)[number]

export const BANNER_BUTTON_STYLE_OPTION_VALUES = [
  'solid-black',
  'solid-white',
  'brand-blue',
  'signal-red',
  'luxury-gold',
  'outline-white',
  'outline-black',
  'editorial-white',
  'editorial-black',
] as const satisfies readonly BannerButtonStyle[]

export const BANNER_BUTTON_LABELS: Record<BannerButtonStyle, string> = {
  'solid-black': 'Black capsule',
  'solid-white': 'White capsule',
  'brand-blue': 'Blue action block',
  'signal-red': 'Crimson action block',
  'luxury-gold': 'Gold frame',
  'outline-white': 'White frame',
  'outline-black': 'Black frame',
  'soft-white': 'Soft white panel',
  'soft-black': 'Soft black panel',
  'editorial-white': 'White underline',
  'editorial-black': 'Black underline',
  'minimal-white': 'Minimal white link',
}

export const BANNER_BUTTON_BASE_CLASS =
  'inline-flex min-h-[3.25em] items-center justify-center gap-[0.65em] whitespace-nowrap px-[1.45em] py-[0.68em] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63f6] focus-visible:ring-offset-2 sm:min-h-[3em] sm:text-sm xl:text-[0.95rem]'

export const BANNER_BUTTON_CLASSES: Record<BannerButtonStyle, string> = {
  'solid-black': 'rounded-full border border-[#05070b] bg-[#05070b] font-bold text-white',
  'solid-white': 'rounded-full border border-white bg-white font-bold text-[#05070b]',
  'brand-blue': 'rounded-none border border-[#0b63f6] bg-[#0b63f6] font-extrabold uppercase tracking-[0.035em] text-white [&>svg]:border-l [&>svg]:border-white/45 [&>svg]:pl-[0.45em]',
  'signal-red': 'rounded-sm border border-[#c91031] bg-[#dc1638] font-extrabold uppercase tracking-[0.035em] text-white',
  'luxury-gold': 'rounded-none border-2 border-[#e7a600] bg-transparent font-bold text-[#e7a600]',
  'outline-white': 'rounded-md border border-white bg-transparent font-semibold text-white',
  'outline-black': 'rounded-md border border-[#05070b] bg-transparent font-semibold text-[#05070b]',
  'soft-white': 'rounded-md border border-white/80 bg-white/90 font-semibold text-[#05070b]',
  'soft-black': 'rounded-md border border-black/40 bg-black/80 font-semibold text-white',
  'editorial-white': 'min-h-0 rounded-none border-b-2 border-white bg-transparent px-0 py-[0.35em] font-serif font-bold text-white',
  'editorial-black': 'min-h-0 rounded-none border-b-2 border-[#05070b] bg-transparent px-0 py-[0.35em] font-serif font-bold text-[#05070b]',
  'minimal-white': 'min-h-0 rounded-none border-l-2 border-white bg-transparent px-[0.85em] py-[0.25em] font-semibold text-white',
}

export const BANNER_TITLE_STYLE_VALUES = [
  'commerce',
  'editorial',
  'technology',
  'fashion',
  'wellness',
  'performance',
  'gaming',
  'collectible',
] as const
export type BannerTitleStyle = (typeof BANNER_TITLE_STYLE_VALUES)[number]

export const BANNER_TITLE_STYLE_LABELS: Record<BannerTitleStyle, string> = {
  commerce: 'Retail sans',
  editorial: 'Editorial serif',
  technology: 'Tech display',
  fashion: 'Fashion serif',
  wellness: 'Wellness sans',
  performance: 'Performance italic',
  gaming: 'Gaming display',
  collectible: 'Collectible poster',
}

export const BANNER_TYPOGRAPHY_CLASSES: Record<BannerTitleStyle, { title: string; subtitle: string }> = {
  commerce: {
    title: 'font-sans font-extrabold tracking-[-0.035em]',
    subtitle: 'font-sans font-medium tracking-[-0.012em]',
  },
  editorial: {
    title: 'font-serif font-bold tracking-[-0.025em]',
    subtitle: 'font-serif font-normal tracking-[-0.008em]',
  },
  technology: {
    title: 'font-sans font-black uppercase tracking-[-0.025em]',
    subtitle: 'font-sans font-semibold tracking-[-0.012em]',
  },
  fashion: {
    title: 'font-serif font-semibold tracking-[-0.018em]',
    subtitle: 'font-serif font-normal tracking-[0.002em]',
  },
  wellness: {
    title: 'font-sans font-semibold tracking-[-0.022em]',
    subtitle: 'font-sans font-normal tracking-[-0.006em]',
  },
  performance: {
    title: 'font-sans font-black italic uppercase tracking-[-0.03em]',
    subtitle: 'font-sans font-semibold italic tracking-[-0.012em]',
  },
  gaming: {
    title: 'font-sans font-black uppercase tracking-[-0.045em]',
    subtitle: 'font-sans font-semibold uppercase tracking-[0.02em]',
  },
  collectible: {
    title: 'font-serif font-bold uppercase tracking-[0.012em]',
    subtitle: 'font-serif font-normal tracking-[0.006em]',
  },
}

export const BANNER_IMAGE_SHADE_VALUES = [
  'none',
  'black-soft',
  'black-medium',
  'black-strong',
  'white-soft',
  'white-medium',
  'white-strong',
] as const
export type BannerImageShade = (typeof BANNER_IMAGE_SHADE_VALUES)[number]

export const BANNER_IMAGE_SHADE_LABELS: Record<BannerImageShade, string> = {
  none: 'None',
  'black-soft': 'Black shade · soft',
  'black-medium': 'Black shade · medium',
  'black-strong': 'Black shade · strong',
  'white-soft': 'White shade · soft',
  'white-medium': 'White shade · medium',
  'white-strong': 'White shade · strong',
}

const LEGACY_TEXT_TONES: Record<string, BannerTextTone> = {
  starlight: 'white',
  light: 'white',
  white: 'white',
  ice: 'white',
  obsidian: 'black',
  dark: 'black',
  carbon: 'black',
  cobalt: 'electric-blue',
  brand: 'electric-blue',
  ruby: 'signal-red',
  crimson: 'signal-red',
  emerald: 'performance-green',
  mint: 'performance-green',
  orange: 'luxury-gold',
  gold: 'luxury-gold',
  amber: 'luxury-gold',
  violet: 'beauty-magenta',
}

const LEGACY_BUTTON_STYLES: Record<string, BannerButtonStyle> = {
  obsidian: 'solid-black',
  dark: 'solid-black',
  carbon: 'solid-black',
  light: 'solid-white',
  cobalt: 'brand-blue',
  brand: 'brand-blue',
  ruby: 'signal-red',
  crimson: 'signal-red',
  orange: 'luxury-gold',
  gold: 'luxury-gold',
  amber: 'luxury-gold',
  emerald: 'soft-black',
  mint: 'soft-white',
  violet: 'soft-black',
  outline: 'outline-white',
}

const LEGACY_TITLE_STYLES: Record<string, BannerTitleStyle> = {
  modern: 'commerce',
  clean: 'wellness',
  statement: 'performance',
}

export const BANNER_TEXT_TONE_ACCEPTED_VALUES = [
  ...BANNER_TEXT_TONE_VALUES,
  'starlight',
  'obsidian',
  'cobalt',
  'ruby',
  'emerald',
  'violet',
  'orange',
] as const

export const BANNER_BUTTON_STYLE_ACCEPTED_VALUES = [
  ...BANNER_BUTTON_STYLE_VALUES,
  'obsidian',
  'cobalt',
  'ruby',
  'emerald',
  'violet',
  'orange',
  'outline',
] as const

export const BANNER_TITLE_STYLE_ACCEPTED_VALUES = [
  ...BANNER_TITLE_STYLE_VALUES,
  'modern',
  'clean',
  'statement',
] as const

export const BANNER_IMAGE_SHADE_ACCEPTED_VALUES = [
  ...BANNER_IMAGE_SHADE_VALUES,
  'soft',
  'medium',
  'strong',
] as const

export function normalizeBannerTextTone(value: string | null | undefined): BannerTextTone {
  if (value === 'beauty-magenta') return 'signal-red'
  if (value === 'gaming-cyan') return 'electric-blue'
  if (BANNER_TEXT_TONE_VALUES.includes(value as BannerTextTone)) return value as BannerTextTone
  return LEGACY_TEXT_TONES[value ?? ''] ?? 'white'
}

export function normalizeBannerButtonStyle(value: string | null | undefined): BannerButtonStyle {
  if (value === 'soft-white') return 'solid-white'
  if (value === 'soft-black') return 'solid-black'
  if (value === 'minimal-white') return 'editorial-white'
  if (BANNER_BUTTON_STYLE_VALUES.includes(value as BannerButtonStyle)) return value as BannerButtonStyle
  return LEGACY_BUTTON_STYLES[value ?? ''] ?? 'solid-black'
}

export function normalizeBannerTitleStyle(value: string | null | undefined): BannerTitleStyle {
  if (BANNER_TITLE_STYLE_VALUES.includes(value as BannerTitleStyle)) return value as BannerTitleStyle
  return LEGACY_TITLE_STYLES[value ?? ''] ?? 'commerce'
}

function textTonePrefersWhiteShade(tone: BannerTextTone) {
  return tone === 'black'
}

export function normalizeBannerImageShade(
  value: string | null | undefined,
  tone: BannerTextTone = 'white',
): BannerImageShade {
  if (BANNER_IMAGE_SHADE_VALUES.includes(value as BannerImageShade)) return value as BannerImageShade
  if (value === 'soft' || value === 'medium' || value === 'strong') {
    return `${textTonePrefersWhiteShade(tone) ? 'white' : 'black'}-${value}` as BannerImageShade
  }
  return textTonePrefersWhiteShade(tone) ? 'white-medium' : 'black-medium'
}

export function getBannerImageShadeStyle(
  shade: BannerImageShade,
  position: 'left' | 'center' | 'right',
): CSSProperties | undefined {
  if (shade === 'none') return undefined

  const [color, strength] = shade.split('-') as ['black' | 'white', 'soft' | 'medium' | 'strong']
  const alpha = { soft: 0.22, medium: 0.42, strong: 0.62 }[strength]
  const rgb = color === 'white' ? '255,255,255' : '4,7,12'

  if (position === 'center') {
    return {
      background: `linear-gradient(90deg, rgba(${rgb},0) 0%, rgba(${rgb},${alpha}) 24%, rgba(${rgb},${alpha}) 76%, rgba(${rgb},0) 100%)`,
    }
  }

  const direction = position === 'right' ? '270deg' : '90deg'
  return {
    background: `linear-gradient(${direction}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${alpha * 0.82}) 36%, rgba(${rgb},0) 76%)`,
  }
}

export function getBannerTextEdgeClass(tone: BannerTextTone, enabled: boolean) {
  if (!enabled) return ''
  return tone === 'black'
    ? '[text-shadow:0_1px_0_rgba(255,255,255,0.32)]'
    : tone === 'white'
      ? '[text-shadow:0_1px_0_rgba(0,0,0,0.5)]'
      : '[text-shadow:0_1px_0_rgba(0,0,0,0.38)]'
}
