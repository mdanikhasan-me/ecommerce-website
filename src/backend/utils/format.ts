// CURRENCY
export function formatPrice(
  price: number,
  currency: string = 'BDT',
  locale: string = 'bn-BD'
): string {
  if (currency === 'BDT') {
    return `Tk ${price.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function calculateDiscount(original: number, sale: number): number {
  if (!sale || sale >= original) return 0
  return Math.round(((original - sale) / original) * 100)
}

// DATE
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateRelative(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(date)
}

// RATING
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.5) return 'Good'
  if (rating >= 3.0) return 'Average'
  return 'Poor'
}

// STOCK
export function getStockStatus(quantity: number): {
  label: string
  color: string
  inStock: boolean
} {
  if (quantity <= 0) return { label: 'Out of Stock', color: 'text-red-500', inStock: false }
  if (quantity <= 5) return { label: `Only ${quantity} left`, color: 'text-amber-500', inStock: true }
  return { label: 'In Stock', color: 'text-green-600', inStock: true }
}
