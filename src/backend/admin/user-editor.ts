import { Prisma, Role } from '@prisma/client'
import { z } from 'zod'

export const ADMIN_MANAGED_ROLES = [Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN] as const

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

const adminUserPayloadSchema = z.object({
  name: optionalTrimmedString(120),
  phone: z
    .string()
    .trim()
    .max(20, 'Invalid phone number')
    .regex(/^[0-9+\-()\s]*$/, 'Invalid phone number')
    .optional()
    .nullable()
    .transform((value) => value || null),
  role: z.enum(ADMIN_MANAGED_ROLES).optional(),
  isActive: z.boolean().optional(),
})

export type AdminUserPayload = z.infer<typeof adminUserPayloadSchema>

export function parseAdminUserPayload(input: unknown) {
  const parsed = adminUserPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid user',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export function parseAdminUserListFilters(searchParams: URLSearchParams) {
  const rawPage = Number(searchParams.get('page') || '1')
  const rawLimit = Number(searchParams.get('limit') || '25')
  const q = searchParams.get('q')?.trim() || ''
  const role = searchParams.get('role')?.trim() || ''
  const validRole = ADMIN_MANAGED_ROLES.includes(role as (typeof ADMIN_MANAGED_ROLES)[number])
    ? (role as (typeof ADMIN_MANAGED_ROLES)[number])
    : ''

  return {
    page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1,
    limit: Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 25,
    q: q.slice(0, 120),
    role: validRole,
  }
}

export function buildAdminUserWhere(filters: { q: string; role: string }): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { email: { contains: filters.q, mode: 'insensitive' } },
      { phone: { contains: filters.q, mode: 'insensitive' } },
    ]
  }

  if (filters.role) {
    where.role = filters.role as Role
  }

  return where
}
