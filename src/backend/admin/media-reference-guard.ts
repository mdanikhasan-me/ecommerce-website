import {
  AdminMediaPathClassification,
  classifyAdminMediaPath,
} from '@/backend/admin/media-lifecycle'

export type AdminMediaReferenceKind = 'active-record' | 'historical-evidence'
export type AdminMediaReferenceValueKind = 'scalar' | 'array'

export type AdminMediaReferenceField = {
  key: string
  model: string
  field: string
  valueKind: AdminMediaReferenceValueKind
  referenceKind: AdminMediaReferenceKind
}

export type AdminMediaReferenceExclusion = {
  model: string
  id: string
  field: string
  value: string
}

export type AdminMediaReferenceFieldCount = {
  fieldKey: string
  count: number
}

export type AdminMediaReferenceCheckInput = {
  candidateUrl: string
  fields: readonly AdminMediaReferenceField[]
  exclude?: readonly AdminMediaReferenceExclusion[]
}

export type AdminMediaReferenceCheckResult = {
  complete: boolean
  fields: readonly AdminMediaReferenceFieldCount[]
  errors?: readonly string[]
}

export type AdminMediaReferenceSource = {
  countReferences(input: AdminMediaReferenceCheckInput): Promise<AdminMediaReferenceCheckResult>
}

export type AdminMediaDeletionReferencePlan = {
  shouldDeleteLocalFile: boolean
  reason: string
  classification: AdminMediaPathClassification
  referenceCount: number
  protectedReferenceCount: number
  checkedFields: string[]
  incomplete: boolean
  errors: string[]
}

export const ADMIN_MEDIA_REFERENCE_FIELDS = [
  {
    key: 'ProductImage.url',
    model: 'ProductImage',
    field: 'url',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'ProductVariant.image',
    model: 'ProductVariant',
    field: 'image',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'ProductSpec.value',
    model: 'ProductSpec',
    field: 'value',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Category.image',
    model: 'Category',
    field: 'image',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Brand.logo',
    model: 'Brand',
    field: 'logo',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Brand.banner',
    model: 'Brand',
    field: 'banner',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Seller.storeLogo',
    model: 'Seller',
    field: 'storeLogo',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Seller.storeBanner',
    model: 'Seller',
    field: 'storeBanner',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Banner.imageUrl',
    model: 'Banner',
    field: 'imageUrl',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Banner.mobileImageUrl',
    model: 'Banner',
    field: 'mobileImageUrl',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'Banner.tabletImageUrl',
    model: 'Banner',
    field: 'tabletImageUrl',
    valueKind: 'scalar',
    referenceKind: 'active-record',
  },
  {
    key: 'OrderItem.imageUrl',
    model: 'OrderItem',
    field: 'imageUrl',
    valueKind: 'scalar',
    referenceKind: 'historical-evidence',
  },
  {
    key: 'ReturnRequest.images',
    model: 'ReturnRequest',
    field: 'images',
    valueKind: 'array',
    referenceKind: 'historical-evidence',
  },
  {
    key: 'Review.images',
    model: 'Review',
    field: 'images',
    valueKind: 'array',
    referenceKind: 'historical-evidence',
  },
  {
    key: 'User.image',
    model: 'User',
    field: 'image',
    valueKind: 'scalar',
    referenceKind: 'historical-evidence',
  },
] as const satisfies readonly AdminMediaReferenceField[]

const FIELD_BY_KEY: ReadonlyMap<string, AdminMediaReferenceField> = new Map(
  ADMIN_MEDIA_REFERENCE_FIELDS.map((field) => [field.key, field]),
)

function normalizeCount(count: number) {
  return Number.isSafeInteger(count) && count > 0 ? count : 0
}

function sanitizeErrorForPlan(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, '[redacted-db-url]').slice(0, 160)
}

export async function planAdminMediaDeletionWithReferences(input: {
  candidateUrl: string | null | undefined
  referenceSource: AdminMediaReferenceSource
  fields?: readonly AdminMediaReferenceField[]
  exclude?: readonly AdminMediaReferenceExclusion[]
}): Promise<AdminMediaDeletionReferencePlan> {
  const fields = input.fields ?? ADMIN_MEDIA_REFERENCE_FIELDS
  const classification = classifyAdminMediaPath(input.candidateUrl)

  if (!classification.canDeleteLocalFile || !classification.normalizedPath) {
    return {
      shouldDeleteLocalFile: false,
      reason: 'Candidate is not an approved local managed upload.',
      classification,
      referenceCount: 0,
      protectedReferenceCount: 0,
      checkedFields: [],
      incomplete: false,
      errors: [],
    }
  }

  let check: AdminMediaReferenceCheckResult
  try {
    check = await input.referenceSource.countReferences({
      candidateUrl: classification.normalizedPath,
      fields,
      exclude: input.exclude,
    })
  } catch (error) {
    return {
      shouldDeleteLocalFile: false,
      reason: 'Reference check failed; physical deletion must be skipped.',
      classification,
      referenceCount: 0,
      protectedReferenceCount: 0,
      checkedFields: [],
      incomplete: true,
      errors: [sanitizeErrorForPlan(error)],
    }
  }

  const checkedFields = check.fields.map((field) => field.fieldKey)
  const missingRequiredFields = fields.filter((field) => !checkedFields.includes(field.key))
  const errors = (check.errors ?? []).map((error) => sanitizeErrorForPlan(error))

  let referenceCount = 0
  let protectedReferenceCount = 0
  for (const fieldCount of check.fields) {
    const count = normalizeCount(fieldCount.count)
    const field = FIELD_BY_KEY.get(fieldCount.fieldKey)
    referenceCount += count
    if (field?.referenceKind === 'historical-evidence') {
      protectedReferenceCount += count
    }
  }

  if (!check.complete || missingRequiredFields.length > 0 || errors.length > 0) {
    return {
      shouldDeleteLocalFile: false,
      reason: 'Reference check was incomplete; physical deletion must be skipped.',
      classification,
      referenceCount,
      protectedReferenceCount,
      checkedFields,
      incomplete: true,
      errors,
    }
  }

  if (protectedReferenceCount > 0) {
    return {
      shouldDeleteLocalFile: false,
      reason: 'Candidate is referenced by protected historical evidence.',
      classification,
      referenceCount,
      protectedReferenceCount,
      checkedFields,
      incomplete: false,
      errors: [],
    }
  }

  if (referenceCount > 0) {
    return {
      shouldDeleteLocalFile: false,
      reason: 'Candidate is still referenced by another media field.',
      classification,
      referenceCount,
      protectedReferenceCount,
      checkedFields,
      incomplete: false,
      errors: [],
    }
  }

  return {
    shouldDeleteLocalFile: true,
    reason: 'Candidate is classifier-approved and no remaining references were reported.',
    classification,
    referenceCount: 0,
    protectedReferenceCount: 0,
    checkedFields,
    incomplete: false,
    errors: [],
  }
}
