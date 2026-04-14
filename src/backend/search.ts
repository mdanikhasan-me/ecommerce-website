type SearchableProduct = {
  name: string
  description?: string | null
  tags?: string[]
  soldCount?: number
  brand?: { name?: string | null } | null
  category?: { name?: string | null } | null
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function normalizeSearchQuery(query: string) {
  return normalize(query)
}

export function tokenizeSearchQuery(query: string) {
  return Array.from(
    new Set(
      normalize(query)
        .split(' ')
        .filter((token) => token.length >= 2 || /^\d+$/.test(token))
    )
  )
}

export function rankProductSearchMatch(product: SearchableProduct, query: string, tokens: string[]) {
  const normalizedQuery = normalize(query)
  const name = normalize(product.name)
  const description = normalize(product.description ?? '')
  const brand = normalize(product.brand?.name ?? '')
  const category = normalize(product.category?.name ?? '')
  const tags = (product.tags ?? []).map(normalize)

  let score = 0

  if (normalizedQuery) {
    if (name === normalizedQuery) score += 1000
    if (name.startsWith(normalizedQuery)) score += 700
    if (name.includes(normalizedQuery)) score += 500
    if (brand === normalizedQuery) score += 420
    if (brand.includes(normalizedQuery)) score += 220
    if (category.includes(normalizedQuery)) score += 120
    if (description.includes(normalizedQuery)) score += 80
  }

  let matchedTokens = 0

  for (const token of tokens) {
    let tokenMatched = false

    if (name.includes(token)) {
      score += /^\d+$/.test(token) ? 35 : 90
      tokenMatched = true
    }
    if (brand.includes(token)) {
      score += 55
      tokenMatched = true
    }
    if (category.includes(token)) {
      score += 30
      tokenMatched = true
    }
    if (tags.some((tag) => tag.includes(token))) {
      score += 35
      tokenMatched = true
    }
    if (description.includes(token)) {
      score += 12
      tokenMatched = true
    }

    if (tokenMatched) matchedTokens += 1
  }

  if (tokens.length > 0) {
    score += matchedTokens * 70
    if (matchedTokens === tokens.length) score += 180
  }

  score += Math.min(product.soldCount ?? 0, 2000) / 25

  return score
}
