import { z } from 'zod'

const stockValue = (label: string) =>
  z.coerce.number().int(`${label} must be a whole number`).min(0, `${label} cannot be negative`).max(1_000_000)

const variantStockSchema = z.object({
  id: z.string().trim().min(1, 'Variant id is required'),
  stockQuantity: stockValue('Variant stock'),
})

const inventoryPayloadSchema = z
  .object({
    stockQuantity: stockValue('Stock quantity'),
    lowStockThreshold: stockValue('Low stock threshold'),
    note: z.string().trim().min(3, 'Adjustment note is required').max(500),
    variants: z.array(variantStockSchema).optional().default([]),
  })
  .superRefine((payload, ctx) => {
    const variantIds = new Set<string>()

    for (const [index, variant] of payload.variants.entries()) {
      if (variantIds.has(variant.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'id'],
          message: 'Duplicate variant updates are not allowed',
        })
        return
      }

      variantIds.add(variant.id)
    }
  })

export type AdminInventoryPayload = z.infer<typeof inventoryPayloadSchema>

export function parseAdminInventoryPayload(input: unknown) {
  const parsed = inventoryPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid inventory update',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
