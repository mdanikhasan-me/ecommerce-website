// ORDER TYPES
export interface OrderData {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  currency: string
  createdAt: Date
  deliveredAt?: Date | null
  items: OrderItemData[]
  address?: AddressData | null
  statusHistory: { status: string; note?: string | null; createdAt: Date }[]
}

export interface OrderItemData {
  id: string
  productName: string
  productSku: string
  variantName?: string | null
  price: number
  quantity: number
  total: number
  imageUrl?: string | null
  productId: string
}

// ADDRESS TYPES
export interface AddressData {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  district: string
  division: string
  postalCode?: string | null
  isDefault: boolean
}
