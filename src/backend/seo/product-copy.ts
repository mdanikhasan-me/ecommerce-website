export type ProductSearchCopyInput = {
  name: string
  price: number
  categoryName?: string | null
  sku?: string | null
  shortDescription?: string | null
  description?: string | null
  tags?: string[] | null
}

export type ProductSearchCopy = {
  title: string
  description: string
  searchTerms: string[]
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value

  const fragment = value.slice(0, maxLength + 1)
  const lastSpace = fragment.lastIndexOf(' ')
  return `${fragment.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`
}

function uniqueTerms(terms: Array<string | null | undefined>) {
  const seen = new Set<string>()

  return terms.reduce<string[]>((result, term) => {
    const value = normalizeText(term)
    if (!value) return result

    const key = value.toLocaleLowerCase('en')
    if (seen.has(key)) return result

    seen.add(key)
    result.push(value)
    return result
  }, [])
}

export function buildProductSearchCopy({
  name,
  price,
  categoryName,
  sku,
  shortDescription,
  description,
  tags,
}: ProductSearchCopyInput): ProductSearchCopy {
  const productName = normalizeText(name)
  const category = normalizeText(categoryName)
  const productSku = normalizeText(sku)
  const summary = truncateAtWord(normalizeText(shortDescription) || normalizeText(description), 72)
  const formattedPrice = new Intl.NumberFormat('en-BD').format(price)
  const titleSuffix = ' Price in Bangladesh | Boilabin'
  const title = `${truncateAtWord(productName, Math.max(24, 70 - titleSuffix.length))}${titleSuffix}`

  const descriptionText = `Buy ${productName} online in Bangladesh for Tk ${formattedPrice}.${summary ? ` ${summary}` : ''} View current stock, product details, and delivery options on Boilabin.`

  return {
    title,
    description: truncateAtWord(descriptionText, 180),
    searchTerms: uniqueTerms([
      productName,
      productSku && `${productName} ${productSku}`,
      `${productName} price in Bangladesh`,
      `${productName} price BD`,
      `buy ${productName} online`,
      `${productName} Bangladesh`,
      category && `${productName} ${category}`,
      category && `buy ${category} online Bangladesh`,
      ...(tags ?? []),
      'Boilabin',
    ]).slice(0, 16),
  }
}
