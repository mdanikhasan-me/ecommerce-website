'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { createRowId, toDateTimeLocalValue } from './form-utils'

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface EditableFlashSale {
  id: string
  title: string
  startsAt: string | Date
  endsAt: string | Date
  isActive: boolean
  items: Array<{
    id: string
    productId: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    maxQuantity: number | null
  }>
}

interface FlashSaleEditorFormProps {
  products: ProductOption[]
  flashSale?: EditableFlashSale
  redirectTo?: string
}

interface FlashSaleItemValue {
  id: string
  productId: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: string
  maxQuantity: string
}

export function FlashSaleEditorForm({
  products,
  flashSale,
  redirectTo = '/admin/flash-sales',
}: FlashSaleEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(flashSale)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: flashSale?.title ?? '',
    startsAt: toDateTimeLocalValue(flashSale?.startsAt),
    endsAt: toDateTimeLocalValue(flashSale?.endsAt),
    isActive: flashSale?.isActive ?? true,
  })
  const [items, setItems] = useState<FlashSaleItemValue[]>(
    flashSale?.items.map((item) => ({
      id: item.id || createRowId(),
      productId: item.productId,
      discountType: item.discountType,
      discountValue: String(item.discountValue),
      maxQuantity: item.maxQuantity?.toString() ?? '',
    })) ?? [],
  )

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateItem = (id: string, field: keyof FlashSaleItemValue, value: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: createRowId(),
        productId: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        maxQuantity: '',
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const buildPayload = () => ({
    title: form.title.trim(),
    startsAt: form.startsAt,
    endsAt: form.endsAt,
    isActive: form.isActive,
    items: items
      .map((item) => ({
        productId: item.productId,
        discountType: item.discountType,
        discountValue: Number(item.discountValue),
        maxQuantity: item.maxQuantity ? Number(item.maxQuantity) : null,
      }))
      .filter((item) => item.productId && Number.isFinite(item.discountValue) && item.discountValue > 0),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/flash-sales/${flashSale!.id}` : '/api/admin/flash-sales',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save flash sale')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError: any) {
      setError(submitError.message || 'Could not save flash sale')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!flashSale) return
    if (!window.confirm('Delete this flash sale?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/flash-sales/${flashSale.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete flash sale')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError: any) {
      setError(deleteError.message || 'Could not delete flash sale')
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Campaign Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Title</label>
                <input aria-label="Form input" title="Form input"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="input-base"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Starts at</label>
                  <input aria-label="Form input" title="Form input"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => updateField('startsAt', event.target.value)}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Ends at</label>
                  <input aria-label="Form input" title="Form input"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => updateField('endsAt', event.target.value)}
                    className="input-base"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Sale Items</h2>
              <button type="button" onClick={addItem} className="btn-outline gap-2 px-3 py-2 text-xs">
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products added yet.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <select aria-label="Select option" title="Select option"
                        value={item.productId}
                        onChange={(event) => updateItem(item.id, 'productId', event.target.value)}
                        className="input-base text-sm"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                      <select aria-label="Select option" title="Select option"
                        value={item.discountType}
                        onChange={(event) => updateItem(item.id, 'discountType', event.target.value)}
                        className="input-base text-sm"
                      >
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FIXED">Fixed amount</option>
                      </select>
                      <input aria-label="Form input" title="Form input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discountValue}
                        onChange={(event) => updateItem(item.id, 'discountValue', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Discount value"
                      />
                      <input aria-label="Form input" title="Form input"
                        type="number"
                        min="0"
                        value={item.maxQuantity}
                        onChange={(event) => updateItem(item.id, 'maxQuantity', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Max quantity"
                      />
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => removeItem(item.id)} className="btn-outline px-3 py-2 text-xs text-red-600">
                        Remove item
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Visibility</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input aria-label="Form input" title="Form input"
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
              Delete flash sale
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save flash sale' : 'Create flash sale'}
          </button>
        </div>
      </div>
    </form>
  )
}
