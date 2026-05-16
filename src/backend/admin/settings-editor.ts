import { z } from 'zod'

export const ADMIN_SETTING_DEFINITIONS = [
  { key: 'site_name', group: 'general' },
  { key: 'site_tagline', group: 'general' },
  { key: 'site_email', group: 'general' },
  { key: 'site_phone', group: 'general' },
  { key: 'site_address', group: 'general' },
  { key: 'low_stock_alert', group: 'inventory' },
] as const

const SETTING_GROUP_BY_KEY = new Map(ADMIN_SETTING_DEFINITIONS.map((definition) => [definition.key, definition.group]))

const settingValueSchemas = {
  site_name: z.string().trim().max(120),
  site_tagline: z.string().trim().max(180),
  site_email: z
    .string()
    .trim()
    .max(180)
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Contact email is invalid'),
  site_phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+\-()\s]*$/, 'Contact phone is invalid'),
  site_address: z.string().trim().max(240),
  low_stock_alert: z.coerce
    .number()
    .int('Low stock threshold must be a whole number')
    .min(0, 'Low stock threshold cannot be negative')
    .max(100_000)
    .transform(String),
} satisfies Record<(typeof ADMIN_SETTING_DEFINITIONS)[number]['key'], z.ZodTypeAny>

type SettingKey = keyof typeof settingValueSchemas

const settingsPayloadSchema = z.object({
  settings: z.record(z.unknown()),
})

export type AdminSettingEntry = {
  key: SettingKey
  value: string
  group: string
}

export function parseAdminSettingsPayload(input: unknown) {
  const parsed = settingsPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: 'Settings payload is invalid',
    }
  }

  const entries: AdminSettingEntry[] = []

  for (const [rawKey, rawValue] of Object.entries(parsed.data.settings)) {
    const key = rawKey as SettingKey
    const schema = settingValueSchemas[key]
    const group = SETTING_GROUP_BY_KEY.get(key)

    if (!schema || !group) {
      return {
        success: false as const,
        error: `Unsupported setting: ${rawKey}`,
      }
    }

    const value = schema.safeParse(rawValue)
    if (!value.success) {
      return {
        success: false as const,
        error: value.error.issues[0]?.message ?? `Invalid value for ${rawKey}`,
      }
    }

    entries.push({ key, value: String(value.data), group })
  }

  return {
    success: true as const,
    data: entries,
  }
}
