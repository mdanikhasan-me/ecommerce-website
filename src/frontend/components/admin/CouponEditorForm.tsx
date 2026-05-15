'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { toDateTimeLocalValue } from './form-utils'

interface CouponOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface EditableCoupon {
  id: string
  code: string
  name: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount: number
  maxDiscount: number | null
  usageLimit: number | null
  perUserLimit: number
  isActive: boolean
  startsAt: string | Date | null
  expiresAt: string | Date | null
  categoryIds: string[]
  productIds: string[]
}

interface CouponEditorFormProps {
  categories: CouponOption[]
  products: ProductOption[]
  coupon?: EditableCoupon
  redirectTo?: string
}

export function CouponEditorForm({
  categories,
  products,
  coupon,
  redirectTo = '/admin/coupons',
}: CouponEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(coupon)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    name: coupon?.name ?? '',
    description: coupon?.description ?? '',
    type: coupon?.type ?? 'PERCENTAGE',
    value: String(coupon?.value ?? ''),
    minOrderAmount: String(coupon?.minOrderAmount ?? 0),
    maxDiscount: coupon?.maxDiscount?.toString() ?? '',
    usageLimit: coupon?.usageLimit?.toString() ?? '',
    perUserLimit: String(coupon?.perUserLimit ?? 1),
    isActive: coupon?.isActive ?? true,
    startsAt: toDateTimeLocalValue(coupon?.startsAt),
    expiresAt: toDateTimeLocalValue(coupon?.expiresAt),
    categoryIds: coupon?.categoryIds ?? [],
    productIds: coupon?.productIds ?? [],
  })
  const fieldIdPrefix = coupon ? `coupon-${coupon.id}` : 'coupon-new'

  const updateField = (field: keyof typeof form, value: string | boolean | string[]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    type: form.type,
    value: Number(form.value),
    minOrderAmount: Number(form.minOrderAmount || 0),
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    perUserLimit: Number(form.perUserLimit || 1),
    isActive: form.isActive,
    startsAt: form.startsAt || null,
    expiresAt: form.expiresAt || null,
    categoryIds: form.categoryIds,
    productIds: form.productIds,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/coupons/${coupon!.id}` : '/api/admin/coupons',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save coupon')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save coupon')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!coupon) return
    if (!window.confirm('Delete this coupon? If it has already been used it will be disabled instead.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete coupon')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete coupon')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Coupon Details</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`${fieldIdPrefix}-code`} className="mb-1.5 block text-sm font-medium">Coupon code</label>
                  <input id={`${fieldIdPrefix}-code`}
                    value={form.code}
                    onChange={(event) => updateField('code', event.target.value.toUpperCase())}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-name`} className="mb-1.5 block text-sm font-medium">Name</label>
                  <input id={`${fieldIdPrefix}-name`}
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldIdPrefix}-description`} className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea id={`${fieldIdPrefix}-description`}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="input-base min-h-[120px] resize-y"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label htmlFor={`${fieldIdPrefix}-type`} className="mb-1.5 block text-sm font-medium">Discount type</label>
                  <select id={`${fieldIdPrefix}-type`}
                    value={form.type}
                    onChange={(event) => updateField('type', event.target.value)}
                    className="input-base"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-value`} className="mb-1.5 block text-sm font-medium">Value</label>
                  <input id={`${fieldIdPrefix}-value`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(event) => updateField('value', event.target.value)}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-min-order`} className="mb-1.5 block text-sm font-medium">Min order amount</label>
                  <input id={`${fieldIdPrefix}-min-order`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(event) => updateField('minOrderAmount', event.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-max-discount`} className="mb-1.5 block text-sm font-medium">Max discount</label>
                  <input id={`${fieldIdPrefix}-max-discount`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(event) => updateField('maxDiscount', event.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-usage-limit`} className="mb-1.5 block text-sm font-medium">Usage limit</label>
                  <input id={`${fieldIdPrefix}-usage-limit`}
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(event) => updateField('usageLimit', event.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-per-user-limit`} className="mb-1.5 block text-sm font-medium">Per user limit</label>
                  <input id={`${fieldIdPrefix}-per-user-limit`}
                    type="number"
                    min="1"
                    value={form.perUserLimit}
                    onChange={(event) => updateField('perUserLimit', event.target.value)}
                    className="input-base"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Restrictions</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={`${fieldIdPrefix}-categories`} className="mb-1.5 block text-sm font-medium">Limit to categories</label>
                <select id={`${fieldIdPrefix}-categories`}
                  multiple
                  value={form.categoryIds}
                  onChange={(event) =>
                    updateField(
                      'categoryIds',
                      Array.from(event.target.selectedOptions, (option) => option.value),
                    )
                  }
                  className="input-base min-h-[180px]"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${fieldIdPrefix}-products`} className="mb-1.5 block text-sm font-medium">Limit to products</label>
                <select id={`${fieldIdPrefix}-products`}
                  multiple
                  value={form.productIds}
                  onChange={(event) =>
                    updateField(
                      'productIds',
                      Array.from(event.target.selectedOptions, (option) => option.value),
                    )
                  }
                  className="input-base min-h-[180px]"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Schedule</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-starts-at`} className="mb-1.5 block text-sm font-medium">Starts at</label>
                <input id={`${fieldIdPrefix}-starts-at`}
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => updateField('startsAt', event.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-expires-at`} className="mb-1.5 block text-sm font-medium">Expires at</label>
                <input id={`${fieldIdPrefix}-expires-at`}
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => updateField('expiresAt', event.target.value)}
                  className="input-base"
                />
              </div>

              <label htmlFor={`${fieldIdPrefix}-active`} className="flex items-center gap-3 text-sm">
                <input id={`${fieldIdPrefix}-active`}
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField('isActive', event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Active
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="btn-outline gap-2 text-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete coupon
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save coupon' : 'Create coupon'}
          </button>
        </div>
      </div>
    </form>
  )
}
