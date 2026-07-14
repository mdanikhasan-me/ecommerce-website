import { z } from 'zod'
import { BANNER_IMAGE_DATA_URL_ERROR, isImageDataUrl } from '@/backend/admin/banner-image-policy'

const INLINE_BANNER_IMAGE_DATA_URL = '__INLINE_BANNER_IMAGE_DATA_URL__'

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

const optionalBannerImageUrl = z
  .preprocess(
    (value) => (typeof value === 'string' && isImageDataUrl(value) ? INLINE_BANNER_IMAGE_DATA_URL : value),
    optionalTrimmedString(500_000),
  )
  .superRefine((value, ctx) => {
    if (value === INLINE_BANNER_IMAGE_DATA_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: BANNER_IMAGE_DATA_URL_ERROR,
      })
    }
  })

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
    imageUrl: optionalBannerImageUrl,
    tabletImageUrl: optionalBannerImageUrl,
    mobileImageUrl: optionalBannerImageUrl,
    linkUrl: optionalTrimmedString(500),
    buttonLabel: optionalTrimmedString(48),
    buttonStyle: z.enum(['light', 'dark', 'brand', 'gold', 'mint', 'outline']).optional().default('light'),
    textPosition: z.enum(['left', 'center', 'right']).optional().default('left'),
    textTone: z.enum(['light', 'white', 'dark', 'brand', 'gold', 'mint']).optional().default('light'),
    overlayStrength: z.enum(['none', 'soft', 'medium', 'strong']).optional().default('medium'),
    textShadow: z.boolean().optional().default(true),
    // Single banner placement for now: the homepage hero. Any legacy value is coerced.
    position: z.string().trim().max(80).optional().transform(() => 'hero' as const),
    sortOrder: z.coerce.number().int('Sort order must be a whole number').min(-9999).max(9999).default(0),
    isActive: z.boolean().optional().default(true),
    startsAt: optionalDate('Start date is invalid'),
    endsAt: optionalDate('End date is invalid'),
  })
  .superRefine((payload, ctx) => {
    if (!payload.title && !payload.subtitle && !payload.imageUrl && !payload.tabletImageUrl && !payload.mobileImageUrl) {
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

    if (payload.startsAt && payload.endsAt && payload.startsAt >= payload.endsAt) {
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
