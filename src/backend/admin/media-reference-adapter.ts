import {
  ADMIN_MEDIA_REFERENCE_FIELDS,
  AdminMediaDeletionReferencePlan,
  AdminMediaReferenceCheckInput,
  AdminMediaReferenceCheckResult,
  AdminMediaReferenceExclusion,
  AdminMediaReferenceField,
  AdminMediaReferenceKind,
  AdminMediaReferenceSource,
  AdminMediaReferenceValueKind,
  planAdminMediaDeletionWithReferences,
} from '@/backend/admin/media-reference-guard'

export type AdminMediaPrismaDelegate = {
  count(args: { where: Record<string, unknown> }): Promise<number> | number
}

export type AdminMediaPrismaReferenceQuery = {
  fieldKey: string
  model: string
  delegateName: AdminMediaPrismaDelegateName
  field: string
  valueKind: AdminMediaReferenceValueKind
  referenceKind: AdminMediaReferenceKind
}

type AdminMediaReferenceModel = (typeof ADMIN_MEDIA_REFERENCE_FIELDS)[number]['model']

const PRISMA_DELEGATE_BY_MODEL = {
  User: 'user',
  Seller: 'seller',
  Category: 'category',
  Brand: 'brand',
  ProductImage: 'productImage',
  ProductVariant: 'productVariant',
  ProductSpec: 'productSpec',
  OrderItem: 'orderItem',
  ReturnRequest: 'returnRequest',
  Review: 'review',
  Banner: 'banner',
} as const satisfies Record<AdminMediaReferenceModel, string>

export type AdminMediaPrismaDelegateName =
  (typeof PRISMA_DELEGATE_BY_MODEL)[keyof typeof PRISMA_DELEGATE_BY_MODEL]

export type AdminMediaPrismaLikeClient = Partial<Record<AdminMediaPrismaDelegateName, AdminMediaPrismaDelegate>>

export const ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES = ADMIN_MEDIA_REFERENCE_FIELDS.map((field) => ({
  fieldKey: field.key,
  model: field.model,
  delegateName: PRISMA_DELEGATE_BY_MODEL[field.model],
  field: field.field,
  valueKind: field.valueKind,
  referenceKind: field.referenceKind,
})) as readonly AdminMediaPrismaReferenceQuery[]

const QUERY_BY_FIELD_KEY: ReadonlyMap<string, AdminMediaPrismaReferenceQuery> = new Map(
  ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES.map((query) => [query.fieldKey, query]),
)

function sanitizeAdapterError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[redacted-db-url]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(password|token|secret|authorization)=\S+/gi, '$1=[redacted]')
    .slice(0, 160)
}

function getMatchingExcludedIds(
  field: AdminMediaReferenceField,
  candidateUrl: string,
  exclude: readonly AdminMediaReferenceExclusion[] = [],
) {
  const ids = new Set<string>()

  for (const exclusion of exclude) {
    if (
      exclusion.model === field.model &&
      exclusion.field === field.field &&
      exclusion.value.trim() === candidateUrl &&
      exclusion.id.trim()
    ) {
      ids.add(exclusion.id.trim())
    }
  }

  return [...ids]
}

export function buildAdminMediaReferenceWhere(input: {
  field: AdminMediaReferenceField
  candidateUrl: string
  exclude?: readonly AdminMediaReferenceExclusion[]
}) {
  const where: Record<string, unknown> = input.field.valueKind === 'array'
    ? { [input.field.field]: { has: input.candidateUrl } }
    : { [input.field.field]: input.candidateUrl }

  const excludedIds = getMatchingExcludedIds(input.field, input.candidateUrl, input.exclude)
  if (excludedIds.length > 0) {
    where.NOT = { id: { in: excludedIds } }
  }

  return where
}

export function createPrismaAdminMediaReferenceSource(
  prisma: AdminMediaPrismaLikeClient,
): AdminMediaReferenceSource {
  return {
    async countReferences(input: AdminMediaReferenceCheckInput): Promise<AdminMediaReferenceCheckResult> {
      const fields = []
      const errors = []
      let complete = true

      for (const field of input.fields) {
        const query = QUERY_BY_FIELD_KEY.get(field.key)
        if (!query?.delegateName) {
          complete = false
          fields.push({ fieldKey: field.key, count: 0 })
          errors.push(`No reference query is configured for ${field.key}.`)
          continue
        }

        const delegate = prisma[query.delegateName]
        if (!delegate || typeof delegate.count !== 'function') {
          complete = false
          fields.push({ fieldKey: field.key, count: 0 })
          errors.push(`Missing read-only count delegate for ${field.key}.`)
          continue
        }

        try {
          const count = await delegate.count({
            where: buildAdminMediaReferenceWhere({
              field,
              candidateUrl: input.candidateUrl,
              exclude: input.exclude,
            }),
          })

          if (!Number.isSafeInteger(count) || count < 0) {
            complete = false
            fields.push({ fieldKey: field.key, count: 0 })
            errors.push(`Invalid count result for ${field.key}.`)
            continue
          }

          fields.push({ fieldKey: field.key, count })
        } catch (error) {
          complete = false
          fields.push({ fieldKey: field.key, count: 0 })
          errors.push(`Reference count failed for ${field.key}: ${sanitizeAdapterError(error)}`)
        }
      }

      return {
        complete,
        fields,
        errors: errors.length > 0 ? errors : undefined,
      }
    },
  }
}

export function planAdminMediaDeletionUsingPrismaReferences(input: {
  candidateUrl: string | null | undefined
  prisma: AdminMediaPrismaLikeClient
  fields?: readonly AdminMediaReferenceField[]
  exclude?: readonly AdminMediaReferenceExclusion[]
}): Promise<AdminMediaDeletionReferencePlan> {
  return planAdminMediaDeletionWithReferences({
    candidateUrl: input.candidateUrl,
    referenceSource: createPrismaAdminMediaReferenceSource(input.prisma),
    fields: input.fields,
    exclude: input.exclude,
  })
}
