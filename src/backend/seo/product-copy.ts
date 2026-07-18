export type ProductSearchFact = {
  name: string
  value: string
}

export type ProductSearchCopyInput = {
  name: string
  price: number
  categoryName?: string | null
  sku?: string | null
  shortDescription?: string | null
  description?: string | null
  tags?: string[] | null
  attributes?: ProductSearchFact[] | null
  specifications?: ProductSearchFact[] | null
  variantOptions?: ProductSearchFact[] | null
  stockQuantity?: number | null
}

export type ProductSearchCopy = {
  title: string
  description: string
  searchTerms: string[]
}

const FACT_PRIORITY = [
  'model',
  'storage',
  'memory',
  'ram',
  'processor',
  'chipset',
  'display',
  'network',
  'color',
  'size',
]

/** Convert editor Markdown/HTML into clean text that is safe for metadata. */
export function normalizeProductSearchText(value: string | null | undefined) {
  return (value ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}(?:[-+*]|\d+[.)])\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_~`]+/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Recognize copy emitted by the retired generator without overriding genuine merchant writing. */
export function isLegacyGeneratedProductDescription(
  value: string | null | undefined,
  productName: string,
) {
  const description = normalizeProductSearchText(value)
  const name = normalizeProductSearchText(productName)
  if (!description || !name) return false

  return description.startsWith(`Buy ${name} online in Bangladesh for Tk `) &&
    description.includes('View current stock, product details')
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value

  const contentLimit = Math.max(1, maxLength - 1)
  const fragment = value.slice(0, contentLimit + 1)
  const lastSpace = fragment.lastIndexOf(' ')
  return `${fragment.slice(0, lastSpace > 0 ? lastSpace : contentLimit).trimEnd()}…`
}

function uniqueTerms(terms: Array<string | null | undefined>) {
  const seen = new Set<string>()

  return terms.reduce<string[]>((result, term) => {
    const value = normalizeProductSearchText(term)
    if (!value) return result

    const key = value.toLocaleLowerCase('en')
    if (seen.has(key)) return result

    seen.add(key)
    result.push(value)
    return result
  }, [])
}

function getFactSummary(facts: ProductSearchFact[]) {
  const ranked = facts
    .map((fact, index) => ({
      name: normalizeProductSearchText(fact.name),
      value: normalizeProductSearchText(fact.value),
      index,
    }))
    .filter((fact) => fact.name && fact.value && fact.value.length <= 48)
    .sort((left, right) => {
      const leftRank = FACT_PRIORITY.indexOf(left.name.toLocaleLowerCase('en'))
      const rightRank = FACT_PRIORITY.indexOf(right.name.toLocaleLowerCase('en'))
      return (leftRank === -1 ? FACT_PRIORITY.length : leftRank) -
        (rightRank === -1 ? FACT_PRIORITY.length : rightRank) || left.index - right.index
    })

  const selected: string[] = []
  let used = 0
  for (const fact of ranked) {
    const phrase = `${fact.name}: ${fact.value}`
    if (used + phrase.length > 64) continue
    selected.push(phrase)
    used += phrase.length + 2
    if (selected.length === 2) break
  }

  return selected.join(', ')
}

export function buildProductSearchCopy({
  name,
  price,
  categoryName,
  sku,
  shortDescription,
  description,
  tags,
  attributes,
  specifications,
  variantOptions,
  stockQuantity,
}: ProductSearchCopyInput): ProductSearchCopy {
  const productName = normalizeProductSearchText(name) || 'Product'
  const category = normalizeProductSearchText(categoryName)
  const productSku = normalizeProductSearchText(sku)
  const facts = [...(attributes ?? []), ...(variantOptions ?? []), ...(specifications ?? [])]
  const factSummary = getFactSummary(facts)
  const contentSummary = truncateAtWord(
    normalizeProductSearchText(shortDescription) || normalizeProductSearchText(description),
    72,
  )
  const validPrice = Number.isFinite(price) && price > 0
  const formattedPrice = validPrice ? new Intl.NumberFormat('en-BD').format(price) : ''
  const titleSuffix = ' Price in Bangladesh | Boilabin'
  const title = `${truncateAtWord(productName, Math.max(24, 70 - titleSuffix.length))}${titleSuffix}`

  const descriptionProductName = truncateAtWord(productName, 72)
  const opening = validPrice
    ? `${descriptionProductName} price in Bangladesh is Tk ${formattedPrice}.`
    : `Check the latest ${descriptionProductName} price in Bangladesh.`
  const detailCandidate = factSummary
    ? `Key details: ${factSummary}.`
    : contentSummary
      ? `${contentSummary}.`
      : category
        ? `Explore current ${category} specifications and buying details.`
        : 'Compare current specifications and buying details.'
  const availability = stockQuantity === undefined || stockQuantity === null
    ? 'View stock and delivery options'
    : stockQuantity > 0
      ? 'In stock—view delivery options'
      : 'Check availability and delivery options'
  const closing = `${availability} at Boilabin.`
  const detailBudget = Math.max(0, 180 - opening.length - closing.length - 2)
  const detail = detailBudget >= 36 ? truncateAtWord(detailCandidate, detailBudget) : ''
  const descriptionText = [opening, detail, closing].filter(Boolean).join(' ')

  const factTerms = facts.flatMap((fact) => {
    const factName = normalizeProductSearchText(fact.name)
    const factValue = normalizeProductSearchText(fact.value)
    if (!factValue) return []
    return [factValue, factName && `${productName} ${factName} ${factValue}`]
  })

  return {
    title,
    description: truncateAtWord(descriptionText, 180),
    searchTerms: uniqueTerms([
      `${productName} price in Bangladesh`,
      `${productName} price BD`,
      `${productName} BD price`,
      `${productName} Bangladesh price`,
      `${productName} latest price Bangladesh`,
      `${productName} current price BD`,
      `buy ${productName} online Bangladesh`,
      `${productName} online price BD`,
      productName,
      productSku && `${productName} ${productSku}`,
      productSku,
      category && `${productName} ${category}`,
      category && `${category} price in Bangladesh`,
      category && `buy ${category} online Bangladesh`,
      ...factTerms,
      ...(tags ?? []),
      'Boilabin Bangladesh',
    ]).slice(0, 30),
  }
}
