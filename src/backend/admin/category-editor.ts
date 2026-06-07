import { z } from 'zod'
import { db } from '@/backend/database'
import {
  CATEGORY_IMAGE_DATA_URL_ERROR,
  isCategoryImageDataUrl,
} from '@/backend/admin/category-image-policy'

type CategoryParentLink = {
  id: string
  parentId: string | null
}

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

function stripCategoryImageVersion(value: string | null | undefined) {
  return value?.replace(/\?v=[a-f0-9]{8,64}$/i, '') ?? value
}

const optionalCategoryImageString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .superRefine((value, context) => {
    const normalized = value?.trim()
    if (!normalized) return

    if (isCategoryImageDataUrl(normalized)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: CATEGORY_IMAGE_DATA_URL_ERROR,
      })
      return
    }

    if (normalized.length > 2048) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category image path is too long',
      })
    }
  })
  .transform((value) => stripCategoryImageVersion(value) || null)

const categoryPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(120, 'Category name is too long'),
  slug: optionalTrimmedString(140),
  description: optionalTrimmedString(500),
  image: optionalCategoryImageString,
  icon: optionalTrimmedString(80),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int('Sort order must be a whole number').min(-9999).max(9999).default(0),
  parentId: optionalTrimmedString(120),
})

export type AdminCategoryPayload = z.infer<typeof categoryPayloadSchema>

export function parseAdminCategoryPayload(input: unknown) {
  const parsed = categoryPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid category',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export async function assertValidCategoryParent(parentId: string | null, excludeId?: string) {
  if (!parentId) return
  if (parentId === excludeId) throw new Error('A category cannot be its own parent')

  let currentParentId: string | null = parentId
  const visited = new Set<string>()

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      throw new Error('Selected parent category has an invalid category chain')
    }

    visited.add(currentParentId)

    const parent: CategoryParentLink | null = await db.category.findUnique({
      where: { id: currentParentId },
      select: { id: true, parentId: true },
    })

    if (!parent) throw new Error('Selected parent category was not found')
    if (parent.id === excludeId) throw new Error('A category cannot use one of its subcategories as parent')

    currentParentId = parent.parentId
  }
}
