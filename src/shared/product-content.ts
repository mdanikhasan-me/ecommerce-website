export const PRODUCT_FAQ_GROUP = '__boilabin_faq__'
export const PRODUCT_DESCRIPTION_IMAGE_GROUP = '__boilabin_description_image__'

export type ProductSpecificationRecord = {
  group?: string | null
  name: string
  value: string
  sortOrder?: number
}

export type ProductFaqRecord = {
  question: string
  answer: string
  sortOrder?: number
}

export type ProductDescriptionImageRecord = {
  url: string
  alt: string
  sortOrder?: number
}

export function splitProductStructuredContent(records: readonly ProductSpecificationRecord[]) {
  const specifications: ProductSpecificationRecord[] = []
  const faqs: ProductFaqRecord[] = []
  const descriptionImages: ProductDescriptionImageRecord[] = []

  for (const record of records) {
    const name = record.name.trim()
    const value = record.value.trim()
    if (!name || !value) continue

    if (record.group === PRODUCT_FAQ_GROUP) {
      faqs.push({ question: name, answer: value, sortOrder: record.sortOrder })
      continue
    }

    if (record.group === PRODUCT_DESCRIPTION_IMAGE_GROUP) {
      descriptionImages.push({ url: value, alt: name, sortOrder: record.sortOrder })
      continue
    }

    specifications.push({
      group: record.group?.trim() || null,
      name,
      value,
      sortOrder: record.sortOrder,
    })
  }

  return { specifications, faqs, descriptionImages }
}
