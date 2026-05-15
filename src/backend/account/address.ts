import { z } from 'zod'

const trimmedString = (max: number, message: string) =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, message)
    .max(max, message)

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

export const addressPayloadSchema = z.object({
  fullName: trimmedString(120, 'Full name is required'),
  phone: trimmedString(20, 'Phone number is required').regex(/^[0-9+\-()\s]+$/, 'Invalid phone number'),
  addressLine1: trimmedString(200, 'Address line 1 is required'),
  addressLine2: optionalTrimmedString(200),
  city: trimmedString(80, 'City is required'),
  district: trimmedString(80, 'District is required'),
  division: trimmedString(80, 'Division is required'),
  postalCode: optionalTrimmedString(20),
  isDefault: z.boolean().optional().default(false),
})

export type AddressPayload = z.infer<typeof addressPayloadSchema>

export function parseAddressPayload(input: unknown) {
  const parsed = addressPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid address',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
