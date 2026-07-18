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
  'beauty-magenta',
  'gaming-cyan',
] as const satisfies readonly BannerTextTone[]

export const BANNER_TEXT_LABELS: Record<BannerTextTone, string> = {
  white: 'High-contrast white',
  black: 'Deep ink',
  'electric-blue': 'Electric blue',
  'signal-red': 'Signal red',
  'performance-green': 'Performance green',
  'luxury-gold': 'Luxury gold',
  'beauty-magenta': 'Beauty magenta',
  'gaming-cyan': 'Gaming cyan',
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
  'soft-white',
  'soft-black',
  'editorial-white',
  'editorial-black',
  'minimal-white',
] as const satisfies readonly BannerButtonStyle[]

export const BANNER_BUTTON_LABELS: Record<BannerButtonStyle, string> = {
  'solid-black': 'Ink pill',
  'solid-white': 'White pill',
  'brand-blue': 'Blue split action',
  'signal-red': 'Red statement',
  'luxury-gold': 'Gold signature',
  'outline-white': 'White precision frame',
  'outline-black': 'Ink precision frame',
  'soft-white': 'White compact panel',
  'soft-black': 'Ink compact panel',
  'editorial-white': 'White editorial line',
  'editorial-black': 'Ink editorial line',
  'minimal-white': 'White side-mark link',
}

export const BANNER_BUTTON_BASE_CLASS =
  'inline-flex min-h-[3em] items-center justify-center gap-[0.65em] whitespace-nowrap px-[1.4em] py-[0.68em] font-sans text-[0.78rem] leading-none antialiased [font-kerning:normal] [font-synthesis:none] [text-rendering:optimizeLegibility] [text-shadow:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63f6] focus-visible:ring-offset-2 sm:text-[0.82rem] xl:text-[0.875rem]'

export const BANNER_BUTTON_CLASSES: Record<BannerButtonStyle, string> = {
  'solid-black': 'rounded-full border border-[#07090d] bg-[#07090d] font-semibold tracking-[-0.005em] text-white',
  'solid-white': 'rounded-full border border-white bg-white font-semibold tracking-[-0.005em] text-[#07090d]',
  'brand-blue': 'rounded-md border border-[#095fe8] bg-[#095fe8] font-semibold tracking-[-0.005em] text-white [&>svg]:ml-[0.15em] [&>svg]:border-l [&>svg]:border-white/40 [&>svg]:pl-[0.5em]',
  'signal-red': 'rounded-sm border border-[#c80f30] bg-[#d71538] font-semibold tracking-[-0.005em] text-white',
  'luxury-gold': 'rounded-none border border-[#dca31c] bg-[#0a0b0e] font-semibold tracking-[0.01em] text-[#f4c75b]',
  'outline-white': 'rounded-md border border-white/95 bg-transparent font-semibold tracking-[-0.005em] text-white',
  'outline-black': 'rounded-md border border-[#07090d] bg-transparent font-semibold tracking-[-0.005em] text-[#07090d]',
  'soft-white': 'rounded-lg border border-white/90 bg-white/90 font-semibold tracking-[-0.005em] text-[#07090d]',
  'soft-black': 'rounded-lg border border-black/55 bg-black/80 font-semibold tracking-[-0.005em] text-white',
  'editorial-white': 'min-h-0 rounded-none border-b border-white bg-transparent px-0 py-[0.38em] font-serif font-semibold tracking-[0.005em] text-white',
  'editorial-black': 'min-h-0 rounded-none border-b border-[#07090d] bg-transparent px-0 py-[0.38em] font-serif font-semibold tracking-[0.005em] text-[#07090d]',
  'minimal-white': 'min-h-0 rounded-none border-l-2 border-white bg-transparent px-[0.85em] py-[0.3em] font-semibold tracking-[-0.005em] text-white',
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
    title: 'font-sans font-bold tracking-[-0.035em] [font-synthesis:none]',
    subtitle: 'font-sans font-medium tracking-[-0.012em] [font-synthesis:none]',
  },
  editorial: {
    title: 'font-serif font-semibold tracking-[-0.025em] [font-synthesis:none]',
    subtitle: 'font-serif font-normal tracking-[-0.008em] [font-synthesis:none]',
  },
  technology: {
    title: 'font-sans font-extrabold uppercase tracking-[-0.022em] [font-synthesis:none]',
    subtitle: 'font-sans font-medium tracking-[-0.008em] [font-synthesis:none]',
  },
  fashion: {
    title: 'font-serif font-semibold tracking-[-0.02em] [font-synthesis:none]',
    subtitle: 'font-serif font-normal tracking-[0.002em] [font-synthesis:none]',
  },
  wellness: {
    title: 'font-sans font-semibold tracking-[-0.025em] [font-synthesis:none]',
    subtitle: 'font-sans font-normal tracking-[-0.006em] [font-synthesis:none]',
  },
  performance: {
    title: 'font-sans font-extrabold italic uppercase tracking-[-0.025em] [font-synthesis:none]',
    subtitle: 'font-sans font-medium italic tracking-[-0.008em] [font-synthesis:none]',
  },
  gaming: {
    title: 'font-sans font-extrabold uppercase tracking-[-0.025em] [font-synthesis:none]',
    subtitle: 'font-sans font-medium tracking-[0.005em] [font-synthesis:none]',
  },
  collectible: {
    title: 'font-serif font-semibold uppercase tracking-[0.006em] [font-synthesis:none]',
    subtitle: 'font-serif font-normal tracking-[0.004em] [font-synthesis:none]',
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

export interface BannerCreativePreset {
  value: string
  label: string
  description: string
  titleStyle: BannerTitleStyle
  textTone: BannerTextTone
  buttonStyle: BannerButtonStyle
  imageShade: BannerImageShade
  textEdge: boolean
}

export const BANNER_CREATIVE_PRESETS: readonly BannerCreativePreset[] = [
  { value: 'retail-dark', label: 'Retail dark', description: 'Clear commerce hierarchy for bright artwork.', titleStyle: 'commerce', textTone: 'black', buttonStyle: 'solid-black', imageShade: 'white-medium', textEdge: false },
  { value: 'retail-light', label: 'Retail light', description: 'High contrast for dark product photography.', titleStyle: 'commerce', textTone: 'white', buttonStyle: 'solid-white', imageShade: 'black-medium', textEdge: true },
  { value: 'technology', label: 'Technology', description: 'Structured tech display with a decisive blue action.', titleStyle: 'technology', textTone: 'white', buttonStyle: 'brand-blue', imageShade: 'black-medium', textEdge: true },
  { value: 'editorial', label: 'Editorial', description: 'Refined serif composition with a restrained underline.', titleStyle: 'editorial', textTone: 'black', buttonStyle: 'editorial-black', imageShade: 'white-medium', textEdge: false },
  { value: 'fashion', label: 'Fashion', description: 'Elegant serif typography and a compact ink action.', titleStyle: 'fashion', textTone: 'black', buttonStyle: 'soft-black', imageShade: 'white-soft', textEdge: false },
  { value: 'wellness', label: 'Wellness', description: 'Calm typography with clean light contrast.', titleStyle: 'wellness', textTone: 'black', buttonStyle: 'outline-black', imageShade: 'white-medium', textEdge: false },
  { value: 'performance', label: 'Performance', description: 'Energetic type with a strong red call to action.', titleStyle: 'performance', textTone: 'white', buttonStyle: 'signal-red', imageShade: 'black-medium', textEdge: true },
  { value: 'gaming', label: 'Gaming', description: 'High-impact display with a focused side-mark action.', titleStyle: 'gaming', textTone: 'gaming-cyan', buttonStyle: 'minimal-white', imageShade: 'black-strong', textEdge: true },
  { value: 'collectible', label: 'Collectible', description: 'Poster-like serif type with a gold signature action.', titleStyle: 'collectible', textTone: 'white', buttonStyle: 'luxury-gold', imageShade: 'black-medium', textEdge: true },
] as const

export const BANNER_IMAGE_SHADE_LABELS: Record<BannerImageShade, string> = {
  none: 'None',
  'black-soft': 'Black shade - soft',
  'black-medium': 'Black shade - medium',
  'black-strong': 'Black shade - strong',
  'white-soft': 'White shade - soft',
  'white-medium': 'White shade - medium',
  'white-strong': 'White shade - strong',
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
    ? '[text-shadow:0_1px_0_rgba(255,255,255,0.22)]'
    : tone === 'white'
      ? '[text-shadow:0_1px_0_rgba(0,0,0,0.34)]'
      : '[text-shadow:0_1px_0_rgba(0,0,0,0.28)]'
}
