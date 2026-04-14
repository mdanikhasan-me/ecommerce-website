// ─── SLUGIFY ──────────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── TRUNCATE ─────────────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// ─── SEARCH PARAMS ────────────────────────────────────────────────────────────

export function buildSearchParams(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v))
  }
  return sp.toString()
}

// ─── IMAGE PLACEHOLDER ────────────────────────────────────────────────────────

export function getImagePlaceholder(width = 400, height = 400, text = 'No Image'): string {
  return `https://placehold.co/${width}x${height}/f5f5f5/999?text=${encodeURIComponent(text)}`
}
