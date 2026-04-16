// ─── PAYMENT TYPES ────────────────────────────────────────────────────────────

export interface PaymentGateway {
  id: string
  name: string
  logo: string
  isAvailable: boolean
  description: string
  disabledReason?: string
  badge?: string
}
