// ─── CATEGORY TYPES ───────────────────────────────────────────────────────────

export interface CategoryTree {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  children: CategoryTree[]
}
