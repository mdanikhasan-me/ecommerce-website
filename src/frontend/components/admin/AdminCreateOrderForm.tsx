'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { formatPrice } from '@/backend/utils/format'
import toast from '@/frontend/lib/toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type AddressOption = {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  division: string
  postalCode: string | null
}

type CustomerOption = {
  id: string
  name: string | null
  email: string
  phone: string | null
  addresses: AddressOption[]
}

type VariantOption = {
  id: string
  name: string
  sku: string
  price: number | null
  salePrice: number | null
  stockQuantity: number
}

type ProductOption = {
  id: string
  name: string
  sku: string
  price: number
  stockQuantity: number
  imageUrl: string | null
  variants: VariantOption[]
}

type OrderLine = {
  key: string
  productId: string
  variantId: string
  quantity: number
}

type CustomAddress = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  district: string
  division: string
  postalCode: string
}

function makeLine(): OrderLine {
  return { key: `${Date.now()}-${Math.random().toString(36).slice(2)}`, productId: '', variantId: '', quantity: 1 }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not create the order'
}

export function AdminCreateOrderForm({
  customers,
  products,
}: {
  customers: CustomerOption[]
  products: ProductOption[]
}) {
  const router = useRouter()
  const submittingRef = useRef(false)
  const [customerId, setCustomerId] = useState('')
  const [addressId, setAddressId] = useState('')
  const paymentMethod = 'CASH_ON_DELIVERY'
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<OrderLine[]>([makeLine()])
  const [submitting, setSubmitting] = useState(false)
  const [customAddress, setCustomAddress] = useState<CustomAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    division: '',
    postalCode: '',
  })

  const selectedCustomer = customers.find((customer) => customer.id === customerId) ?? null
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const estimatedSubtotal = lines.reduce((sum, line) => {
    const product = productMap.get(line.productId)
    if (!product) return sum
    const variant = product.variants.find((item) => item.id === line.variantId)
    const unitPrice = variant ? variant.salePrice ?? variant.price ?? product.price : product.price
    return sum + unitPrice * Math.max(1, line.quantity)
  }, 0)

  const selectCustomer = (nextCustomerId: string) => {
    const customer = customers.find((item) => item.id === nextCustomerId) ?? null
    setCustomerId(nextCustomerId)
    setAddressId(customer?.addresses[0]?.id ?? (nextCustomerId ? 'custom' : ''))
    setCustomAddress((current) => ({
      ...current,
      fullName: customer?.name ?? '',
      phone: customer?.phone ?? '',
    }))
  }

  const updateLine = (key: string, update: Partial<OrderLine>) => {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...update } : line))
  }

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submittingRef.current) return
    if (!customerId) {
      toast.error('Select a customer')
      return
    }
    if (!addressId) {
      toast.error('Select or enter a delivery address')
      return
    }
    const validLines = lines.filter((line) => line.productId && line.quantity > 0)
    if (validLines.length === 0) {
      toast.error('Add at least one product')
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customerId,
          addressId: addressId === 'custom' ? null : addressId,
          address: addressId === 'custom'
            ? {
                ...customAddress,
                addressLine2: customAddress.addressLine2 || null,
                postalCode: customAddress.postalCode || null,
              }
            : null,
          saveAddress: false,
          paymentMethod,
          notes,
          couponCode: null,
          items: validLines.map((line) => {
            return {
              productId: line.productId,
              variantId: line.variantId || null,
              quantity: line.quantity,
            }
          }),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not create the order')
      toast.success(`Order ${data.orderNumber} created`)
      router.push(`/admin/orders/${data.orderId}`)
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitOrder} className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.7fr)] xl:items-start">
      <div className="min-w-0 space-y-5">
        <section className="admin-card p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="admin-section-title">Customer and delivery</h2>
            <p className="mt-1 text-xs text-muted-foreground">Choose an active customer and a verified delivery destination.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Customer</span>
              <select value={customerId} onChange={(event) => selectCustomer(event.target.value)} className="input-base" required>
                <option value="">Select customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name ?? customer.email} · {customer.email}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Delivery address</span>
              <select value={addressId} onChange={(event) => setAddressId(event.target.value)} className="input-base" disabled={!selectedCustomer} required>
                <option value="">Select address</option>
                {selectedCustomer?.addresses.map((address) => <option key={address.id} value={address.id}>{address.addressLine1}, {address.city}</option>)}
                {selectedCustomer ? <option value="custom">Enter another address</option> : null}
              </select>
            </label>
          </div>

          {addressId === 'custom' ? (
            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              {([
                ['fullName', 'Full name'],
                ['phone', 'Phone'],
                ['addressLine1', 'Address line 1'],
                ['addressLine2', 'Address line 2 (optional)'],
                ['city', 'City'],
                ['district', 'District'],
                ['division', 'Division'],
                ['postalCode', 'Postal code (optional)'],
              ] as const).map(([field, label]) => (
                <label key={field} className={field.startsWith('addressLine') ? 'sm:col-span-2' : ''}>
                  <span className="mb-1.5 block text-sm font-semibold">{label}</span>
                  <input
                    value={customAddress[field]}
                    onChange={(event) => setCustomAddress((current) => ({ ...current, [field]: event.target.value }))}
                    className="input-base"
                    required={!label.includes('optional')}
                  />
                </label>
              ))}
            </div>
          ) : null}
        </section>

        <section className="admin-card p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="admin-section-title">Order items</h2>
              <p className="mt-1 text-xs text-muted-foreground">Prices and stock are revalidated securely when the order is created.</p>
            </div>
            <button type="button" onClick={() => setLines((current) => [...current, makeLine()])} className="admin-table-action">
              Add item <LocalIcon name="plus" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3">
            {lines.map((line, index) => {
              const product = productMap.get(line.productId)
              const variant = product?.variants.find((item) => item.id === line.variantId)
              const availableStock = variant ? Math.min(product?.stockQuantity ?? 0, variant.stockQuantity) : product?.stockQuantity ?? 0
              const unitPrice = variant ? variant.salePrice ?? variant.price ?? product?.price ?? 0 : product?.price ?? 0
              return (
                <div key={line.key} className="grid gap-3 rounded-[0.65rem] border border-border bg-secondary/25 p-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(10rem,0.8fr)_7rem_7rem_auto] lg:items-end">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Product {index + 1}</span>
                    <select value={line.productId} onChange={(event) => updateLine(line.key, { productId: event.target.value, variantId: '', quantity: 1 })} className="input-base" required>
                      <option value="">Select product</option>
                      {products.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku} · {item.stockQuantity} available</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Variant</span>
                    <select value={line.variantId} onChange={(event) => updateLine(line.key, { variantId: event.target.value, quantity: 1 })} className="input-base" disabled={!product?.variants.length}>
                      <option value="">Base product</option>
                      {product?.variants.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.stockQuantity} available</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Quantity</span>
                    <input type="number" min={1} max={Math.max(1, availableStock)} value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="input-base" required />
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Line total</span>
                    <span className="flex min-h-11 items-center font-semibold">{formatPrice(unitPrice * line.quantity)}</span>
                  </div>
                  <button type="button" onClick={() => setLines((current) => current.length === 1 ? current : current.filter((item) => item.key !== line.key))} className="admin-icon-button" aria-label={`Remove item ${index + 1}`} disabled={lines.length === 1}>
                    <LocalIcon name="trash-2" className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section className="admin-card p-4 sm:p-5">
          <h2 className="admin-section-title">Payment and notes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Payment method</span>
              <select defaultValue={paymentMethod} className="input-base">
                <option value="CASH_ON_DELIVERY">Cash on delivery</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Admin note (optional)</span>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} className="input-base" placeholder="Delivery or customer-service context" />
            </label>
          </div>
        </section>
      </div>

      <aside className="admin-card p-4 sm:p-5 xl:sticky xl:top-5">
        <h2 className="admin-section-title">Order summary</h2>
        <div className="mt-4 space-y-3 border-y border-border py-4 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Customer</span><span className="text-right font-semibold">{selectedCustomer?.name ?? selectedCustomer?.email ?? 'Not selected'}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Line items</span><span className="font-semibold">{lines.filter((line) => line.productId).length}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Estimated subtotal</span><span className="font-semibold">{formatPrice(estimatedSubtotal)}</span></div>
          <p className="text-xs leading-5 text-muted-foreground">Shipping, discounts and the final total are calculated by the same server-side pipeline used by checkout.</p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full justify-center disabled:opacity-50">
          {submitting ? 'Creating order…' : 'Create order'} <LocalIcon name="arrow-right" className="h-4 w-4" />
        </button>
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LocalIcon name="shield" className="h-4 w-4" /> Stock checked securely</p>
      </aside>
    </form>
  )
}
