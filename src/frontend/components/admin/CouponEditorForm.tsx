'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Save, Search, Trash2, X } from 'lucide-react'
import { formatPrice } from '@/backend/utils'
import { calculateCouponDiscount, getPercentageCapThreshold } from '@/shared/coupon-math'
import { AdminDateTimeField } from './AdminDateTimeField'
import { toDateTimeLocalValue } from './form-utils'

interface CouponOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
  categoryName?: string
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

type PickerOption = {
  id: string
  name: string
  detail?: string
}

function EligibilityPicker({
  id,
  title,
  options,
  selectedIds,
  query,
  onQueryChange,
  onToggle,
  onClear,
}: {
  id: string
  title: string
  options: PickerOption[]
  selectedIds: string[]
  query: string
  onQueryChange: (value: string) => void
  onToggle: (id: string) => void
  onClear: () => void
}) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions = useMemo(() => options.filter((option) => (
    !normalizedQuery || `${option.name} ${option.detail ?? ''}`.toLowerCase().includes(normalizedQuery)
  )).slice(0, 100), [normalizedQuery, options])

  return (
    <div className="rounded-lg bg-secondary/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{selectedIds.length} selected</p>
        </div>
        {selectedIds.length ? (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-primary">
            Clear
          </button>
        ) : null}
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}`}
          className="input-base pl-9"
        />
      </div>

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1">
        {visibleOptions.length ? visibleOptions.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-md bg-card px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={selectedSet.has(option.id)}
              onChange={() => onToggle(option.id)}
              className="size-4 rounded border-input"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{option.name}</span>
              {option.detail ? <span className="block truncate text-[11px] text-muted-foreground">{option.detail}</span> : null}
            </span>
            {selectedSet.has(option.id) ? <Check className="h-4 w-4 text-primary" /> : null}
          </label>
        )) : (
          <p className="rounded-md bg-card px-3 py-6 text-center text-xs text-muted-foreground">No matching options</p>
        )}
      </div>
    </div>
  )
}

export function CouponEditorForm({
  categories,
  products,
  coupon,
  redirectTo = '/admin/coupons',
}: CouponEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(coupon)
  const hasInitialRestrictions = Boolean(coupon?.categoryIds.length || coupon?.productIds.length)
  const [scope, setScope] = useState<'ALL' | 'LIMITED'>(hasInitialRestrictions ? 'LIMITED' : 'ALL')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
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

  const toggleSelection = (field: 'categoryIds' | 'productIds', id: string) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(id)
        ? current[field].filter((selectedId) => selectedId !== id)
        : [...current[field], id],
    }))
  }

  const buildPayload = () => ({
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    type: form.type,
    value: Number(form.value),
    minOrderAmount: Number(form.minOrderAmount || 0),
    maxDiscount: form.type === 'PERCENTAGE' && form.maxDiscount ? Number(form.maxDiscount) : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    perUserLimit: Number(form.perUserLimit || 1),
    isActive: form.isActive,
    startsAt: form.startsAt || null,
    expiresAt: form.expiresAt || null,
    categoryIds: scope === 'LIMITED' ? form.categoryIds : [],
    productIds: scope === 'LIMITED' ? form.productIds : [],
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (scope === 'LIMITED' && form.categoryIds.length === 0 && form.productIds.length === 0) {
      setError('Select at least one category or product, or apply the coupon to the entire catalog')
      return
    }

    setIsSaving(true)
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
      if (!response.ok) throw new Error(data.error || 'Could not save coupon')

      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save coupon')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!coupon || !window.confirm('Delete this coupon? Used coupons will be disabled instead.')) return

    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not delete coupon')

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete coupon')
    } finally {
      setIsDeleting(false)
    }
  }

  const value = Number(form.value) || 0
  const minimumSpend = Math.max(0, Number(form.minOrderAmount) || 0)
  const maxDiscount = form.type === 'PERCENTAGE' ? Number(form.maxDiscount) || null : null
  const exampleSpend = minimumSpend > 0 ? minimumSpend : Math.max(form.type === 'FIXED' ? value : 1000, 1000)
  const exampleDiscount = calculateCouponDiscount(exampleSpend, { type: form.type, value, maxDiscount })
  const capStartsAt = form.type === 'PERCENTAGE' ? getPercentageCapThreshold(value, maxDiscount) : null
  const selectedCount = scope === 'LIMITED' ? form.categoryIds.length + form.productIds.length : 0
  const categoryOptions = useMemo(() => categories.map((category) => ({ id: category.id, name: category.name })), [categories])
  const productOptions = useMemo(() => products.map((product) => ({
    id: product.id,
    name: product.name,
    detail: product.categoryName ? `${product.sku} · ${product.categoryName}` : product.sku,
  })), [products])

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20 sm:pb-0">
      {error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="min-w-0 space-y-5">
          <section className="admin-card p-5 sm:p-6">
            <div>
              <h2 className="admin-section-title">Identity</h2>
              <p className="mt-1 text-xs text-muted-foreground">Name the promotion and create the code customers will enter.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={`${fieldIdPrefix}-code`} className="mb-1.5 block text-sm font-medium">Coupon code</label>
                <input
                  id={`${fieldIdPrefix}-code`}
                  value={form.code}
                  onChange={(event) => updateField('code', event.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase())}
                  className="input-base font-mono font-semibold uppercase"
                  placeholder="WELCOME15"
                  required
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-name`} className="mb-1.5 block text-sm font-medium">Internal name</label>
                <input
                  id={`${fieldIdPrefix}-name`}
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="input-base"
                  placeholder="Welcome discount"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`${fieldIdPrefix}-description`} className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea
                  id={`${fieldIdPrefix}-description`}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="input-base min-h-24 resize-y"
                  placeholder="Optional note for the admin team"
                />
              </div>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div>
              <h2 className="admin-section-title">Discount rules</h2>
              <p className="mt-1 text-xs text-muted-foreground">Set the qualifying spend, discount value, and practical limits.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label htmlFor={`${fieldIdPrefix}-type`} className="mb-1.5 block text-sm font-medium">Discount type</label>
                <select
                  id={`${fieldIdPrefix}-type`}
                  value={form.type}
                  onChange={(event) => updateField('type', event.target.value)}
                  className="input-base"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-value`} className="mb-1.5 block text-sm font-medium">Discount value</label>
                <div className="relative">
                  <input
                    id={`${fieldIdPrefix}-value`}
                    type="number"
                    min="0.01"
                    max={form.type === 'PERCENTAGE' ? 100 : 10000000}
                    step="0.01"
                    value={form.value}
                    onChange={(event) => updateField('value', event.target.value)}
                    className="input-base pr-12"
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {form.type === 'PERCENTAGE' ? '%' : 'Tk'}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-min-order`} className="mb-1.5 block text-sm font-medium">Minimum qualifying spend</label>
                <input
                  id={`${fieldIdPrefix}-min-order`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(event) => updateField('minOrderAmount', event.target.value)}
                  className="input-base"
                />
              </div>
              {form.type === 'PERCENTAGE' ? (
                <div>
                  <label htmlFor={`${fieldIdPrefix}-max-discount`} className="mb-1.5 block text-sm font-medium">Maximum discount</label>
                  <input
                    id={`${fieldIdPrefix}-max-discount`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(event) => updateField('maxDiscount', event.target.value)}
                    className="input-base"
                    placeholder="No maximum"
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor={`${fieldIdPrefix}-usage-limit`} className="mb-1.5 block text-sm font-medium">Total usage limit</label>
                <input
                  id={`${fieldIdPrefix}-usage-limit`}
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(event) => updateField('usageLimit', event.target.value)}
                  className="input-base"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-per-user-limit`} className="mb-1.5 block text-sm font-medium">Per customer limit</label>
                <input
                  id={`${fieldIdPrefix}-per-user-limit`}
                  type="number"
                  min="1"
                  step="1"
                  value={form.perUserLimit}
                  onChange={(event) => updateField('perUserLimit', event.target.value)}
                  className="input-base"
                  required
                />
              </div>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div>
              <h2 className="admin-section-title">Eligible items</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Restricted coupons calculate the minimum spend and discount from matching items only.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={scope === 'ALL'}
                onClick={() => setScope('ALL')}
                className={`rounded-lg px-4 py-4 text-left ${scope === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-foreground'}`}
              >
                <span className="block text-sm font-semibold">Entire catalog</span>
                <span className={`mt-1 block text-xs ${scope === 'ALL' ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>Every eligible product can qualify.</span>
              </button>
              <button
                type="button"
                aria-pressed={scope === 'LIMITED'}
                onClick={() => setScope('LIMITED')}
                className={`rounded-lg px-4 py-4 text-left ${scope === 'LIMITED' ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-foreground'}`}
              >
                <span className="block text-sm font-semibold">Selected items</span>
                <span className={`mt-1 block text-xs ${scope === 'LIMITED' ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>Choose categories, products, or both.</span>
              </button>
            </div>

            {scope === 'LIMITED' ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <EligibilityPicker
                  id={`${fieldIdPrefix}-categories`}
                  title="Categories"
                  options={categoryOptions}
                  selectedIds={form.categoryIds}
                  query={categoryQuery}
                  onQueryChange={setCategoryQuery}
                  onToggle={(id) => toggleSelection('categoryIds', id)}
                  onClear={() => updateField('categoryIds', [])}
                />
                <EligibilityPicker
                  id={`${fieldIdPrefix}-products`}
                  title="Products"
                  options={productOptions}
                  selectedIds={form.productIds}
                  query={productQuery}
                  onQueryChange={setProductQuery}
                  onToggle={(id) => toggleSelection('productIds', id)}
                  onClear={() => updateField('productIds', [])}
                />
              </div>
            ) : null}
          </section>
        </div>

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-0">
          <section className="admin-card p-5">
            <h2 className="admin-section-title">Discount summary</h2>
            {value > 0 ? (
              <div className="mt-4 rounded-lg bg-secondary/55 p-4">
                <p className="text-xs text-muted-foreground">At {formatPrice(exampleSpend)} qualifying spend</p>
                <p className="mt-1 admin-page-title text-foreground">{formatPrice(exampleDiscount)} saved</p>
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-secondary/55 px-4 py-5 text-sm text-muted-foreground">Enter a discount value to calculate the offer.</p>
            )}
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Scope</dt>
                <dd className="text-right font-semibold">{scope === 'ALL' ? 'Entire catalog' : `${selectedCount} selected`}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Minimum spend</dt>
                <dd className="text-right font-semibold">{minimumSpend > 0 ? formatPrice(minimumSpend) : 'None'}</dd>
              </div>
              {capStartsAt ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Maximum reached at</dt>
                  <dd className="text-right font-semibold">{formatPrice(capStartsAt)}</dd>
                </div>
              ) : null}
            </dl>
            {capStartsAt && minimumSpend >= capStartsAt ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">The maximum discount is already reached when this coupon becomes eligible.</p>
            ) : null}
          </section>

          <section className="admin-card p-5">
            <h2 className="admin-section-title">Publishing</h2>
            <div className="mt-4 space-y-4">
              <AdminDateTimeField
                id={`${fieldIdPrefix}-starts-at`}
                label="Starts at"
                value={form.startsAt}
                onChange={(nextValue) => updateField('startsAt', nextValue)}
                helperText="Leave empty to make it available immediately."
                allowNow
              />
              <AdminDateTimeField
                id={`${fieldIdPrefix}-expires-at`}
                label="Expires at"
                value={form.expiresAt}
                onChange={(nextValue) => updateField('expiresAt', nextValue)}
                helperText="Leave empty for no expiry date."
              />
              <label htmlFor={`${fieldIdPrefix}-active`} className="flex items-center justify-between rounded-lg bg-secondary/55 px-4 py-3 text-sm font-semibold">
                Active
                <input
                  id={`${fieldIdPrefix}-active`}
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField('isActive', event.target.checked)}
                  className="size-4 rounded border-input"
                />
              </label>
            </div>
          </section>
        </aside>
      </div>

      <div className="admin-form-actions admin-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="btn-outline gap-2 text-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete coupon
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline gap-2">
            <X className="h-4 w-4" /> Cancel
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
