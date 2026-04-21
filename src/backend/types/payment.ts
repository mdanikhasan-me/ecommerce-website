// PAYMENT TYPES
export interface PaymentGateway {
  id: string
  name: string
  logo?: string
  logos?: Array<{
    src: string
    alt: string
    width: number
    height: number
  }>
  isAvailable: boolean
  description: string
  disabledReason?: string
  badge?: string
}
