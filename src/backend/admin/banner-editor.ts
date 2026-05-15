import { z } from 'zod'

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

const optionalDate = (message: string) =>
  z
    .union([z.coerce.date(), z.literal(null), z.literal(''), z.undefined()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return null
      if (Number.isNaN(value.getTime())) throw new Error(message)
      return value
    })

const bannerPayloadSchema = z
  .object({
    title: optionalTrimmedString(140),
    subtitle: optionalTrimmedString(240),
    imageUrl: optionalTrimmedString(500_000),
    mobileImageUrl: optionalTrimmedString(500_000),
    linkUrl: optionalTrimmedString(500),
    position: z.string().trim().min(1).max(80).optional().default('hero'),
    sortOrder: z.coerce.number().int('Sort order must be a whole number').min(-9999).max(9999).default(0),
    isActive: z.boolean().optional().default(true),
    startsAt: optionalDate('Start date is invalid'),
    endsAt: optionalDate('End date is invalid'),
  })
  .superRefine((payload, ctx) => {
    if (!payload.title && !payload.subtitle && !payload.imageUrl && !payload.mobileImageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageUrl'],
        message: 'Banner needs at least an image, title, or subtitle',
      })
    }

    if (payload.linkUrl && !payload.linkUrl.startsWith('/') && !/^https?:\/\//i.test(payload.linkUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkUrl'],
        message: 'Link URL must be a site path or an http(s) URL',
      })
    }

    if (payload.startsAt && payload.endsAt && payload.startsAt > payload.endsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'End date must be later than the start date',
      })
    }
  })

export type AdminBannerPayload = z.infer<typeof bannerPayloadSchema>

export function parseAdminBannerPayload(input: unknown) {
  const parsed = bannerPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid banner',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
