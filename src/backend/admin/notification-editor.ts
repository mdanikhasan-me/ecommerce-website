import { NotificationType, Prisma } from '@prisma/client'
import { z } from 'zod'

export const ADMIN_NOTIFICATION_TYPES = Object.values(NotificationType)
export const ADMIN_NOTIFICATION_RECIPIENT_TYPES = ['ALL', 'CUSTOMERS', 'USER'] as const

const optionalLink = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .transform((value) => value || null)
  .refine((value) => !value || value.startsWith('/') || /^https?:\/\//i.test(value), {
    message: 'Link must be a site path or an http(s) URL',
  })

const notificationPayloadSchema = z
  .object({
    recipientType: z.enum(ADMIN_NOTIFICATION_RECIPIENT_TYPES, { message: 'Recipient type is invalid' }),
    userId: z.string().trim().optional().nullable().transform((value) => value || null),
    type: z.nativeEnum(NotificationType, { message: 'Notification type is invalid' }).optional().default('SYSTEM'),
    title: z.string().trim().min(1, 'Title is required').max(140),
    message: z.string().trim().min(1, 'Message is required').max(1000),
    link: optionalLink,
  })
  .superRefine((payload, ctx) => {
    if (payload.recipientType === 'USER' && !payload.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userId'],
        message: 'Select a user',
      })
    }
  })

const notificationReadPayloadSchema = z.object({
  isRead: z.boolean({ message: 'isRead is required' }),
})

export type AdminNotificationPayload = z.infer<typeof notificationPayloadSchema>

export function parseAdminNotificationPayload(input: unknown) {
  const parsed = notificationPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid notification',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export function parseAdminNotificationReadPayload(input: unknown) {
  const parsed = notificationReadPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid notification update',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export function resolveNotificationAudienceWhere(
  recipientType: AdminNotificationPayload['recipientType'],
): Prisma.UserWhereInput {
  if (recipientType === 'CUSTOMERS') {
    return { role: 'CUSTOMER', isActive: true }
  }

  return { isActive: true }
}
