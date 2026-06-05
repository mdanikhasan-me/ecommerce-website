// SLUGIFY
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// TRUNCATE
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// SEARCH PARAMS
export function buildSearchParams(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v))
  }
  return sp.toString()
}

// IMAGE PLACEHOLDER
export function getImagePlaceholder(width = 400, height = 400, text = 'No Image'): string {
  const safeWidth = Number.isFinite(width) && width > 0 ? Math.round(width) : 400
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.round(height) : 400
  const safeText = text
    .replace(/[<>&"']/g, '')
    .trim()
    .slice(0, 48) || 'No Image'
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">`,
    '<rect width="100%" height="100%" fill="#f5f5f5"/>',
    '<rect x="0.5" y="0.5" width="99%" height="99%" fill="none" stroke="#d6d3d1"/>',
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#78716c" font-family="Arial, sans-serif" font-size="20">${safeText}</text>`,
    '</svg>',
  ].join('')

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
