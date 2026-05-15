import { z } from 'zod'

const profilePayloadSchema = z.object({
  name: z.string().trim().min(1, 'Name must be between 1 and 120 characters').max(120, 'Name must be between 1 and 120 characters'),
  phone: z
    .string()
    .trim()
    .max(20, 'Invalid phone number')
    .regex(/^[0-9+\-()\s]*$/, 'Invalid phone number')
    .optional()
    .nullable()
    .transform((value) => value || null),
})

export type ProfilePayload = z.infer<typeof profilePayloadSchema>

export function parseProfilePayload(input: unknown) {
  const parsed = profilePayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid profile',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
