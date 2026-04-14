export const CATEGORY_PRESENTATION: Record<
  string,
  {
    asset: string
    band: string
    chip: string
    panel: string
    accent: string
  }
> = {
  electronics: {
    asset: '/images/categories/electronics.svg',
    band: 'from-sky-500 via-blue-500 to-indigo-500',
    chip: 'bg-sky-50 text-sky-700',
    panel: 'border-sky-100 bg-sky-50/80',
    accent: 'text-sky-700',
  },
  fashion: {
    asset: '/images/categories/fashion.svg',
    band: 'from-rose-400 via-pink-500 to-fuchsia-500',
    chip: 'bg-rose-50 text-rose-700',
    panel: 'border-rose-100 bg-rose-50/80',
    accent: 'text-rose-700',
  },
  'home-appliances': {
    asset: '/images/categories/home-appliances.svg',
    band: 'from-amber-400 via-orange-400 to-orange-500',
    chip: 'bg-amber-50 text-amber-700',
    panel: 'border-amber-100 bg-amber-50/80',
    accent: 'text-amber-700',
  },
  'beauty-health': {
    asset: '/images/categories/beauty-health.svg',
    band: 'from-pink-400 via-rose-400 to-pink-500',
    chip: 'bg-pink-50 text-pink-700',
    panel: 'border-pink-100 bg-pink-50/80',
    accent: 'text-pink-700',
  },
  'sports-fitness': {
    asset: '/images/categories/sports-fitness.svg',
    band: 'from-emerald-400 via-teal-500 to-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700',
    panel: 'border-emerald-100 bg-emerald-50/80',
    accent: 'text-emerald-700',
  },
  'books-stationery': {
    asset: '/images/categories/books-stationery.svg',
    band: 'from-violet-400 via-purple-500 to-violet-600',
    chip: 'bg-violet-50 text-violet-700',
    panel: 'border-violet-100 bg-violet-50/80',
    accent: 'text-violet-700',
  },
  gaming: {
    asset: '/images/categories/gaming.svg',
    band: 'from-indigo-500 via-violet-500 to-indigo-700',
    chip: 'bg-indigo-50 text-indigo-700',
    panel: 'border-indigo-100 bg-indigo-50/80',
    accent: 'text-indigo-700',
  },
  'baby-kids': {
    asset: '/images/categories/baby-kids.svg',
    band: 'from-cyan-400 via-sky-500 to-cyan-600',
    chip: 'bg-cyan-50 text-cyan-700',
    panel: 'border-cyan-100 bg-cyan-50/80',
    accent: 'text-cyan-700',
  },
}

export const DEFAULT_CATEGORY_PRESENTATION = {
  asset: '/images/categories/default.svg',
  band: 'from-slate-500 via-slate-600 to-slate-700',
  chip: 'bg-secondary text-foreground',
  panel: 'border-border bg-secondary',
  accent: 'text-foreground',
}
