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

export const BANNER_TEXT_LABELS: Record<BannerTextTone, string> = {
  white: 'Gallery white',
  black: 'Carbon black',
  'electric-blue': 'Electric blue',
  'signal-red': 'Signal red',
  'performance-green': 'Performance green',
  'luxury-gold': 'Luxury gold',
  'beauty-magenta': 'Beauty magenta',
  'gaming-cyan': 'Gaming cyan',
}

export const BANNER_TEXT_CLASSES: Record<BannerTextTone, string> = {
  white: 'text-white',
  black: 'text-[#05070b]',
  'electric-blue': 'text-[#075bff]',
  'signal-red': 'text-[#ff234f]',
  'performance-green': 'text-[#00a86b]',
  'luxury-gold': 'text-[#ffbd00]',
  'beauty-magenta': 'text-[#ff2d95]',
  'gaming-cyan': 'text-[#00c8ff]',
}

export const BANNER_TEXT_SWATCHES: Record<BannerTextTone, string> = {
  white: '#ffffff',
  black: '#05070b',
  'electric-blue': '#075bff',
  'signal-red': '#ff234f',
  'performance-green': '#00a86b',
  'luxury-gold': '#ffbd00',
  'beauty-magenta': '#ff2d95',
  'gaming-cyan': '#00c8ff',
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

export const BANNER_BUTTON_LABELS: Record<BannerButtonStyle, string> = {
  'solid-black': 'Black pill',
  'solid-white': 'White pill',
  'brand-blue': 'Brand blue',
  'signal-red': 'Signal red',
  'luxury-gold': 'Luxury gold',
  'outline-white': 'White outline',
  'outline-black': 'Black outline',
  'soft-white': 'Soft white panel',
  'soft-black': 'Soft black panel',
  'editorial-white': 'Editorial white',
  'editorial-black': 'Editorial black',
  'minimal-white': 'Minimal white link',
}

export const BANNER_BUTTON_BASE_CLASS =
  'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 sm:text-sm'

export const BANNER_BUTTON_CLASSES: Record<BannerButtonStyle, string> = {
  'solid-black': 'rounded-full bg-[#05070b] px-5 py-2.5 font-bold text-white',
  'solid-white': 'rounded-full bg-white px-5 py-2.5 font-bold text-[#05070b]',
  'brand-blue': 'rounded-md bg-[#075bff] px-5 py-2.5 font-bold text-white',
  'signal-red': 'rounded-md bg-[#e80035] px-5 py-2.5 font-bold text-white',
  'luxury-gold': 'rounded-sm bg-[#ffbd00] px-5 py-2.5 font-bold text-[#160f00]',
  'outline-white': 'rounded-full border border-white bg-transparent px-5 py-2.5 font-semibold text-white',
  'outline-black': 'rounded-full border border-[#05070b] bg-transparent px-5 py-2.5 font-semibold text-[#05070b]',
  'soft-white': 'rounded-md bg-white/90 px-5 py-2.5 font-semibold text-[#05070b]',
  'soft-black': 'rounded-md bg-black/75 px-5 py-2.5 font-semibold text-white',
  'editorial-white': 'rounded-none border-b-2 border-white bg-transparent px-0 py-2 font-serif font-bold text-white',
  'editorial-black': 'rounded-none border-b-2 border-[#05070b] bg-transparent px-0 py-2 font-serif font-bold text-[#05070b]',
  'minimal-white': 'rounded-none bg-transparent px-0 py-2 font-semibold text-white underline decoration-2 underline-offset-4',
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
  commerce: 'Commerce bold',
  editorial: 'Editorial serif',
  technology: 'Technology mono',
  fashion: 'Fashion editorial',
  wellness: 'Wellness clean',
  performance: 'Performance italic',
  gaming: 'Gaming display',
  collectible: 'Collectible campaign',
}

export const BANNER_TYPOGRAPHY_CLASSES: Record<BannerTitleStyle, { title: string; subtitle: string }> = {
  commerce: {
    title: 'font-sans font-black tracking-[-0.045em]',
    subtitle: 'font-sans font-medium tracking-[-0.01em]',
  },
  editorial: {
    title: 'font-serif font-bold tracking-[-0.035em]',
    subtitle: 'font-serif font-normal tracking-[-0.01em]',
  },
  technology: {
    title: 'font-mono font-bold uppercase tracking-[-0.035em]',
    subtitle: 'font-mono font-medium tracking-[-0.02em]',
  },
  fashion: {
    title: 'font-serif font-bold uppercase tracking-[0.015em]',
    subtitle: 'font-serif font-normal tracking-[0.01em]',
  },
  wellness: {
    title: 'font-sans font-semibold tracking-[-0.03em]',
    subtitle: 'font-sans font-normal tracking-normal',
  },
  performance: {
    title: 'font-sans font-black italic uppercase tracking-[-0.035em]',
    subtitle: 'font-sans font-semibold italic tracking-[-0.015em]',
  },
  gaming: {
    title: 'font-mono font-black uppercase tracking-[-0.045em]',
    subtitle: 'font-mono font-semibold tracking-[-0.025em]',
  },
  collectible: {
    title: 'font-sans font-extrabold uppercase tracking-[0.025em]',
    subtitle: 'font-sans font-medium tracking-[0.01em]',
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
  if (BANNER_TEXT_TONE_VALUES.includes(value as BannerTextTone)) return value as BannerTextTone
  return LEGACY_TEXT_TONES[value ?? ''] ?? 'white'
}

export function normalizeBannerButtonStyle(value: string | null | undefined): BannerButtonStyle {
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
    ? '[text-shadow:0_1px_0_rgba(255,255,255,0.82)]'
    : '[text-shadow:0_1px_0_rgba(0,0,0,0.82)]'
}
