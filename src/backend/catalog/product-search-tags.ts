type AutomaticSearchFact = {
  name?: string | null
  value?: string | null
}

type AutomaticProductTagInput = {
  name: string
  sku?: string | null
  categoryName?: string | null
  parentCategoryName?: string | null
  attributes?: AutomaticSearchFact[] | null
  specifications?: AutomaticSearchFact[] | null
  variantOptions?: AutomaticSearchFact[] | null
}

function normalizeTag(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

const STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'the', 'to', 'with'])

const SEMANTIC_TAG_RULES: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /\b(iphone|galaxy|pixel|smartphone|mobile|phone)\b/i, tags: ['phone', 'smartphone', 'mobile', 'mobile phone'] },
  { pattern: /\b(iphone|ipad|macbook|airpods|apple watch)\b/i, tags: ['apple'] },
  { pattern: /\b(galaxy|samsung)\b/i, tags: ['samsung', 'android', 'android phone'] },
  { pattern: /\b(pixel)\b/i, tags: ['google', 'android', 'android phone'] },
  { pattern: /\b(laptop|notebook|macbook|chromebook)\b/i, tags: ['laptop', 'notebook', 'computer'] },
  { pattern: /\b(playstation\s*5|ps5)\b/i, tags: ['ps5', 'playstation', 'sony playstation', 'gaming console', 'game console'] },
  { pattern: /\b(playstation|xbox|nintendo|console)\b/i, tags: ['gaming', 'gaming console', 'game console'] },
  { pattern: /\b(headphone|headphones|headset|earbud|earbuds|airpods)\b/i, tags: ['audio', 'headphone', 'headphones', 'earphones'] },
  { pattern: /\b(tv|television|smart tv)\b/i, tags: ['tv', 'television', 'smart tv', 'display'] },
  { pattern: /\b(monitor|display)\b/i, tags: ['monitor', 'display', 'computer monitor'] },
  { pattern: /\b(air conditioner|air conditioning|inverter ac|ac)\b/i, tags: ['air conditioner', 'ac', 'inverter ac'] },
  { pattern: /\b(refrigerator|fridge|freezer)\b/i, tags: ['refrigerator', 'fridge', 'home appliance'] },
  { pattern: /\b(washing machine|washer)\b/i, tags: ['washing machine', 'washer', 'home appliance'] },
  { pattern: /\b(camera|dslr|mirrorless)\b/i, tags: ['camera', 'photography'] },
  { pattern: /\b(smartwatch|smart watch|apple watch)\b/i, tags: ['smartwatch', 'smart watch', 'wearable'] },
  { pattern: /\b(router|wi-?fi|wifi)\b/i, tags: ['router', 'wifi', 'networking'] },
  { pattern: /\b(jeans|denim)\b/i, tags: ['jeans', 'denim', 'pants'] },
  { pattern: /\b(sneaker|sneakers|trainer|trainers)\b/i, tags: ['sneakers', 'shoes', 'footwear'] },
]

const SEARCH_ALIAS_RULES: Array<{ pattern: RegExp; aliases: string[] }> = [
  { pattern: /\bps5\b/i, aliases: ['playstation 5', 'playstation'] },
  { pattern: /\bplaystation\s*5\b/i, aliases: ['ps5'] },
  { pattern: /\bps4\b/i, aliases: ['playstation 4', 'playstation'] },
  { pattern: /\bplaystation\s*4\b/i, aliases: ['ps4'] },
  { pattern: /\b(cell ?phone|cellular phone)\b/i, aliases: ['phone', 'mobile', 'smartphone'] },
  { pattern: /\b(earphone|earphones)\b/i, aliases: ['earbuds', 'headphones', 'audio'] },
  { pattern: /\bfridge\b/i, aliases: ['refrigerator'] },
  { pattern: /\brefrigerator\b/i, aliases: ['fridge'] },
  { pattern: /\binverter ac\b/i, aliases: ['air conditioner', 'ac'] },
  { pattern: /^ac$/i, aliases: ['air conditioner'] },
  { pattern: /^tv$/i, aliases: ['television', 'smart tv'] },
  { pattern: /\bnotebook\b/i, aliases: ['laptop'] },
]

function getUsefulTokens(value: string) {
  return normalizeTag(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

/** Expand only well-known shopper synonyms; bounded to keep every search query cheap. */
export function getProductSearchAliases(query: string) {
  const normalizedQuery = normalizeTag(query)
  const aliases = SEARCH_ALIAS_RULES
    .filter((rule) => rule.pattern.test(normalizedQuery))
    .flatMap((rule) => rule.aliases)
    .map(normalizeTag)
    .filter(Boolean)

  return [...new Set(aliases)].slice(0, 6)
}

export function buildAutomaticProductTags(input: AutomaticProductTagInput) {
  const name = normalizeTag(input.name)
  const sku = normalizeTag(input.sku ?? '')
  const category = normalizeTag(input.categoryName ?? '')
  const parentCategory = normalizeTag(input.parentCategoryName ?? '')
  const nameTokens = getUsefulTokens(name)
  const categoryTokens = getUsefulTokens(`${category} ${parentCategory}`)
  const facts = [
    ...(input.attributes ?? []),
    ...(input.specifications ?? []),
    ...(input.variantOptions ?? []),
  ]
  const factValues = facts
    .map((fact) => normalizeTag(fact.value ?? ''))
    .filter((value) => value && value.length <= 60)
  const factTokens = factValues.flatMap(getUsefulTokens)
  const candidates = [
    name,
    sku,
    ...nameTokens,
    ...nameTokens.slice(0, -1).map((token, index) => `${token} ${nameTokens[index + 1]}`),
    category,
    parentCategory,
    ...categoryTokens,
  ]

  const semanticSource = [
    input.name,
    input.categoryName,
    input.parentCategoryName,
    ...facts.flatMap((fact) => [fact.name, fact.value]),
  ].filter(Boolean).join(' ')
  for (const rule of SEMANTIC_TAG_RULES) {
    if (rule.pattern.test(semanticSource)) candidates.push(...rule.tags)
  }

  candidates.push(...factValues, ...factTokens)

  const seen = new Set<string>()
  const tags: string[] = []
  for (const candidate of candidates) {
    const normalized = normalizeTag(candidate).slice(0, 60).trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    tags.push(normalized)
    if (tags.length === 30) break
  }

  return tags
}
