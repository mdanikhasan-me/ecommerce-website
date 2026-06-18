type CategoryConfig = {
  eyebrow: string
  summary: string
  accent: string
  accentDark: string
  surface: string
  border: string
  glowClass: string
  linkClass: string
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  electronics: {
    eyebrow: 'Tech essentials',
    summary: 'Phones, laptops, audio, and smart gear for work, play, and everyday upgrades.',
    accent: '#4f6bff',
    accentDark: '#1d2b63',
    surface: '#eef3ff',
    border: '#d6dfff',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(79,107,255,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#1d2b63]',
  },
  fashion: {
    eyebrow: 'Daily style',
    summary: "Wardrobe basics, statement pieces, and easy routes into men's and women's collections.",
    accent: '#e24d9c',
    accentDark: '#71284e',
    surface: '#fff0f7',
    border: '#ffd7ea',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(226,77,156,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#71284e]',
  },
  'home-appliances': {
    eyebrow: 'Home setup',
    summary: 'Kitchen tools, home upgrades, and practical essentials for everyday living.',
    accent: '#d08a1f',
    accentDark: '#6c4a16',
    surface: '#fff5df',
    border: '#f9e3ad',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(208,138,31,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#6c4a16]',
  },
  'beauty-health': {
    eyebrow: 'Care and wellness',
    summary: 'Self care, grooming, and wellness products gathered into one easy starting point.',
    accent: '#d84f84',
    accentDark: '#6f2945',
    surface: '#fff1f6',
    border: '#ffd6e4',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(216,79,132,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#6f2945]',
  },
  'sports-fitness': {
    eyebrow: 'Active living',
    summary: 'Training gear, recovery staples, and fitness essentials for an active routine.',
    accent: '#1d9a74',
    accentDark: '#155744',
    surface: '#edf9f5',
    border: '#cbece0',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(29,154,116,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#155744]',
  },
  'books-stationery': {
    eyebrow: 'Reading and work',
    summary: 'Books, study supplies, and desk essentials organized into a calmer library-style section.',
    accent: '#7a58f4',
    accentDark: '#3f2d80',
    surface: '#f3efff',
    border: '#ded1ff',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(122,88,244,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#3f2d80]',
  },
  gaming: {
    eyebrow: 'Play and performance',
    summary: 'Consoles, accessories, and gaming gear collected into a dedicated hub.',
    accent: '#5c63ff',
    accentDark: '#26318e',
    surface: '#eef0ff',
    border: '#d2d7ff',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(92,99,255,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#26318e]',
  },
  'toys-collectibles': {
    eyebrow: 'Play and collectibles',
    summary: 'Hot Wheels, LEGO sets, diecast models, action figures, and collectible cards for focused browsing.',
    accent: '#0f8f85',
    accentDark: '#10554f',
    surface: '#edfbf9',
    border: '#c7eee9',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(15,143,133,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#10554f]',
  },
  'baby-kids': {
    eyebrow: 'Play and collectibles',
    summary: 'Legacy category route fallback for toys, model cars, figures, building sets, and cards.',
    accent: '#0f8f85',
    accentDark: '#10554f',
    surface: '#edfbf9',
    border: '#c7eee9',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(15,143,133,0.14)_0%,transparent_56%)]',
    linkClass: 'text-[#10554f]',
  },
}

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  eyebrow: 'Department',
  summary: 'Browse the full department and jump into the right collection from one place.',
  accent: '#4b5563',
  accentDark: '#1f2937',
  surface: '#f4f4f5',
  border: '#e5e7eb',
  glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(75,85,99,0.12)_0%,transparent_56%)]',
  linkClass: 'text-[#1f2937]',
}

export function getCategoryConfig(slug: string) {
  return CATEGORY_CONFIG[slug] ?? DEFAULT_CATEGORY_CONFIG
}
