import {
  Baby,
  BookOpen,
  ChefHat,
  Dumbbell,
  Gamepad2,
  LayoutGrid,
  MonitorSmartphone,
  Shirt,
  Sparkles,
} from 'lucide-react'

type CategoryIcon = typeof MonitorSmartphone

type CategoryConfig = {
  icon: CategoryIcon
  eyebrow: string
  summary: string
  accent: string
  accentDark: string
  surface: string
  border: string
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  electronics: {
    icon: MonitorSmartphone,
    eyebrow: 'Tech essentials',
    summary: 'Phones, laptops, audio, and smart gear for work, play, and everyday upgrades.',
    accent: '#4f6bff',
    accentDark: '#1d2b63',
    surface: '#eef3ff',
    border: '#d6dfff',
  },
  fashion: {
    icon: Shirt,
    eyebrow: 'Daily style',
    summary: "Wardrobe basics, statement pieces, and easy routes into men's and women's collections.",
    accent: '#e24d9c',
    accentDark: '#71284e',
    surface: '#fff0f7',
    border: '#ffd7ea',
  },
  'home-appliances': {
    icon: ChefHat,
    eyebrow: 'Home setup',
    summary: 'Kitchen tools, home upgrades, and practical essentials for everyday living.',
    accent: '#d08a1f',
    accentDark: '#6c4a16',
    surface: '#fff5df',
    border: '#f9e3ad',
  },
  'beauty-health': {
    icon: Sparkles,
    eyebrow: 'Care and wellness',
    summary: 'Self care, grooming, and wellness products gathered into one easy starting point.',
    accent: '#d84f84',
    accentDark: '#6f2945',
    surface: '#fff1f6',
    border: '#ffd6e4',
  },
  'sports-fitness': {
    icon: Dumbbell,
    eyebrow: 'Active living',
    summary: 'Training gear, recovery staples, and fitness essentials for an active routine.',
    accent: '#1d9a74',
    accentDark: '#155744',
    surface: '#edf9f5',
    border: '#cbece0',
  },
  'books-stationery': {
    icon: BookOpen,
    eyebrow: 'Reading and work',
    summary: 'Books, study supplies, and desk essentials organized into a calmer library-style section.',
    accent: '#7a58f4',
    accentDark: '#3f2d80',
    surface: '#f3efff',
    border: '#ded1ff',
  },
  gaming: {
    icon: Gamepad2,
    eyebrow: 'Play and performance',
    summary: 'Consoles, accessories, and gaming gear collected into a dedicated hub.',
    accent: '#5c63ff',
    accentDark: '#26318e',
    surface: '#eef0ff',
    border: '#d2d7ff',
  },
  'baby-kids': {
    icon: Baby,
    eyebrow: 'Family essentials',
    summary: 'Baby care, toys, and practical kids essentials designed for faster browsing.',
    accent: '#1da4c7',
    accentDark: '#19586d',
    surface: '#eefaff',
    border: '#ceeff9',
  },
}

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  icon: LayoutGrid,
  eyebrow: 'Department',
  summary: 'Browse the full department and jump into the right collection from one place.',
  accent: '#4b5563',
  accentDark: '#1f2937',
  surface: '#f4f4f5',
  border: '#e5e7eb',
}

export function getCategoryConfig(slug: string) {
  return CATEGORY_CONFIG[slug] ?? DEFAULT_CATEGORY_CONFIG
}
