'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from '@/frontend/lib/toast'

interface InventoryAdjustmentPanelProps {
  product: {
    id: string
    name: string
    sku: string
    stockQuantity: number
    lowStockThreshold: number
    variants: Array<{
      id: string
      name: string
      sku: string
      stockQuantity: number
      isActive: boolean
    }>
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function InventoryAdjustmentPanel({ product }: InventoryAdjustmentPanelProps) {
  const router = useRouter()
  const fieldIdPrefix = `inventory-${product.id}`
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity.toString())
  const [lowStockThreshold, setLowStockThreshold] = useState(product.lowStockThreshold.toString())
  const [variants, setVariants] = useState(
    product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity.toString(),
      isActive: variant.isActive,
    })),
  )

  const updateVariant = (id: string, value: string) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, stockQuantity: value } : variant,
      ),
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/inventory/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockQuantity: Number(stockQuantity),
          lowStockThreshold: Number(lowStockThreshold),
          note,
          variants: variants.map((variant) => ({
            id: variant.id,
            stockQuantity: Number(variant.stockQuantity),
          })),
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update inventory')
      }

      toast.success('Inventory updated')
      setOpen(false)
      setNote('')
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not update inventory'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-primary">
        Adjust
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="admin-card max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-b-none p-4 text-left sm:max-h-[85vh] sm:rounded-[0.625rem] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.sku}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-outline px-3 py-2 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`${fieldIdPrefix}-product-stock`} className="mb-1.5 block text-sm font-medium">
                    Product stock
                  </label>
                  <input
                    id={`${fieldIdPrefix}-product-stock`}
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-low-stock-threshold`} className="mb-1.5 block text-sm font-medium">
                    Low stock threshold
                  </label>
                  <input
                    id={`${fieldIdPrefix}-low-stock-threshold`}
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(event) => setLowStockThreshold(event.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldIdPrefix}-note`} className="mb-1.5 block text-sm font-medium">
                  Adjustment note
                </label>
                <textarea
                  id={`${fieldIdPrefix}-note`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="input-base min-h-[110px] resize-y"
                  placeholder="Explain why this stock change is being made"
                  required
                />
              </div>

              {variants.length > 0 && (
                <section className="space-y-3 rounded-lg bg-secondary/45 p-4">
                  <div>
                    <h4 className="font-display font-semibold">Variant stock</h4>
                    <p className="text-sm text-muted-foreground">
                      Update per-variant inventory from the same panel.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div key={variant.id} className="grid gap-3 admin-card p-3 md:grid-cols-[minmax(0,1fr)_120px]">
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {variant.sku} - {variant.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <label className="sr-only" htmlFor={`${fieldIdPrefix}-variant-${variant.id}`}>
                          Stock for {variant.name}
                        </label>
                        <input
                          id={`${fieldIdPrefix}-variant-${variant.id}`}
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(event) => updateVariant(variant.id, event.target.value)}
                          className="input-base"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:flex sm:items-center sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
