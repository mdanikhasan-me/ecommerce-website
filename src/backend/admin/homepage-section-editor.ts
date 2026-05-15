import { Prisma } from '@prisma/client'
import { z } from 'zod'

type HomepageSectionConfig = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

function isJsonInputValue(value: unknown): value is Prisma.InputJsonValue {
  if (value === null) return true
  if (typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isJsonInputValue)
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(
      (entry) => entry !== undefined && isJsonInputValue(entry),
    )
  }

  return false
}

function parseConfig(input: unknown): HomepageSectionConfig {
  if (input === null || input === undefined || input === '') return Prisma.JsonNull

  const config = typeof input === 'string' ? JSON.parse(input) : input
  if (!isJsonInputValue(config)) {
    throw new Error('Config must be valid JSON')
  }

  if (config === null) return Prisma.JsonNull
  return config
}

const homepageSectionPayloadSchema = z
  .object({
    type: z
      .string()
      .trim()
      .min(1, 'Section type is required')
      .max(80)
      .regex(/^[a-z][a-z0-9_:-]*$/i, 'Section type can only use letters, numbers, underscores, dashes, or colons'),
    title: optionalTrimmedString(160),
    subtitle: optionalTrimmedString(260),
    config: z.unknown().optional().nullable(),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.coerce.number().int('Sort order must be a whole number').min(-9999).max(9999).default(0),
  })
  .transform((payload) => ({
    ...payload,
    config: parseConfig(payload.config),
  }))

export type AdminHomepageSectionPayload = z.infer<typeof homepageSectionPayloadSchema>

export function parseAdminHomepageSectionPayload(input: unknown) {
  try {
    const parsed = homepageSectionPayloadSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? 'Invalid homepage section',
      }
    }

    return {
      success: true as const,
      data: parsed.data,
    }
  } catch {
    return {
      success: false as const,
      error: 'Config must be valid JSON',
    }
  }
}
