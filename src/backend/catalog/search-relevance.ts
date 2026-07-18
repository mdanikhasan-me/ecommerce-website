import { getProductSearchAliases } from './product-search-tags'

type SearchRankCandidate = {
  name: string
  soldCount?: number | null
  rating?: number | null
  reviewCount?: number | null
  tags?: string[] | null
  shortDescription?: string | null
  category?: { name?: string | null } | null
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function getTokens(value: string) {
  const normalized = normalizeSearchText(value)
  if (!normalized) return []
  return Array.from(new Set(normalized.split(' ').filter((token) => token.length >= 2)))
}

function countOrderedTokenRun(queryTokens: string[], nameTokens: string[]) {
  let bestRun = 0

  for (let start = 0; start < queryTokens.length; start += 1) {
    let run = 0
    let nameIndex = 0

    for (let queryIndex = start; queryIndex < queryTokens.length; queryIndex += 1) {
      const foundAt = nameTokens.findIndex((token, index) => index >= nameIndex && token === queryTokens[queryIndex])
      if (foundAt === -1) break
      run += 1
      nameIndex = foundAt + 1
    }

    bestRun = Math.max(bestRun, run)
  }

  return bestRun
}

function tokenMatchScore(queryToken: string, targetTokens: string[]) {
  if (targetTokens.includes(queryToken)) return 70
  if (targetTokens.some((token) => token.startsWith(queryToken))) return 50
  if (targetTokens.some((token) => token.includes(queryToken))) return 34
  return 0
}

function getNameTokenWeight(token: string, index: number) {
  const baseWeight = index === 0 ? 1.4 : index === 1 ? 0.85 : index === 2 ? 0.95 : 0.8
  return index > 0 && /^\d+$/.test(token) ? baseWeight * 0.72 : baseWeight
}

export function getProductSearchRelevanceScore(query: string, product: SearchRankCandidate) {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedAliases = getProductSearchAliases(query).map(normalizeSearchText)
  const queryTokens = getTokens(query)
  if (!normalizedQuery || queryTokens.length === 0) return 0

  const normalizedName = normalizeSearchText(product.name)
  const nameTokens = getTokens(product.name)
  const normalizedCategory = normalizeSearchText(product.category?.name ?? '')
  const categoryTokens = getTokens(product.category?.name ?? '')
  const tagTokens = getTokens((product.tags ?? []).join(' '))
  const normalizedDescription = normalizeSearchText(product.shortDescription ?? '')

  let score = 0

  if (normalizedName === normalizedQuery) score += 900
  if (normalizedName.startsWith(normalizedQuery)) score += 620
  if (normalizedName.includes(normalizedQuery)) score += 520
  if (normalizedAliases.some((alias) => normalizedName.includes(alias))) score += 500
  if (normalizedAliases.some((alias) => normalizedCategory.includes(alias))) score += 320

  let exactNameMatches = 0
  for (const [index, token] of queryTokens.entries()) {
    const tokenScore = tokenMatchScore(token, nameTokens)
    if (tokenScore === 70) exactNameMatches += 1
    score += tokenScore * getNameTokenWeight(token, index)
  }

  const orderedRun = countOrderedTokenRun(queryTokens, nameTokens)
  score += orderedRun * 34

  if (exactNameMatches === queryTokens.length) score += 260
  else if (queryTokens.length > 1 && exactNameMatches >= queryTokens.length - 1) score += 145

  if (normalizedCategory.includes(normalizedQuery)) score += 120
  for (const [index, token] of queryTokens.entries()) {
    const secondaryWeight = index === 0 ? 1.2 : 1
    score += tokenMatchScore(token, categoryTokens) * 0.45
    score += tokenMatchScore(token, tagTokens) * 0.35 * secondaryWeight
  }

  if (normalizedDescription.includes(normalizedQuery)) score += 35

  return score
}

export function sortByProductSearchRelevance<T extends SearchRankCandidate>(query: string, products: T[]) {
  return products
    .map((product, index) => ({
      product,
      index,
      score: getProductSearchRelevanceScore(query, product),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if ((b.product.soldCount ?? 0) !== (a.product.soldCount ?? 0)) {
        return (b.product.soldCount ?? 0) - (a.product.soldCount ?? 0)
      }
      if ((b.product.reviewCount ?? 0) !== (a.product.reviewCount ?? 0)) {
        return (b.product.reviewCount ?? 0) - (a.product.reviewCount ?? 0)
      }
      if ((b.product.rating ?? 0) !== (a.product.rating ?? 0)) {
        return (b.product.rating ?? 0) - (a.product.rating ?? 0)
      }
      return a.index - b.index
    })
    .map((entry) => entry.product)
}
