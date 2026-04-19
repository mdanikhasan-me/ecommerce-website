'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, Trash2, ImagePlus } from 'lucide-react'

interface Category {
  id: string
  name: string
  parentId: string | null
}

interface Brand {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  brands: Brand[]
  sellerId: string
  product?: any
}

export function ProductForm({ categories, brands, sellerId, product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    shortDescription: product?.shortDescription ?? '',
    sku: product?.sku ?? '',
    price: product?.price?.toString() ?? '',
    salePrice: product?.salePrice?.toString() ?? '',
    costPrice: product?.costPrice?.toString() ?? '',
    stockQuantity: product?.stockQuantity?.toString() ?? '0',
    categoryId: product?.categoryId ?? '',
    brandId: product?.brandId ?? '',
    weight: product?.weight?.toString() ?? '',
    isActive: product?.isActive ?? false,
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
    metaTitle: product?.metaTitle ?? '',
    metaDescription: product?.metaDescription ?? '',
  })

  const [variants, setVariants] = useState<Array<{ name: string; value: string; price: string; stock: string }>>(
    product?.variants?.map((v: any) => ({
      name: v.name,
      value: v.value,
      price: v.price?.toString() ?? '',
      stock: v.stockQuantity?.toString() ?? '0',
    })) ?? []
  )

  const parentCategories = categories.filter((c) => !c.parentId)
  const childCategories = categories.filter((c) => c.parentId)

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const addVariant = () => setVariants((prev) => [...prev, { name: '', value: '', price: '', stock: '0' }])
  const removeVariant = (idx: number) => setVariants((prev) => prev.filter((_, i) => i !== idx))
  const updateVariant = (idx: number, field: string, value: string) =>
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        stockQuantity: parseInt(form.stockQuantity),
        weight: form.weight ? parseFloat(form.weight) : null,
        sellerId,
        variants: variants
          .filter((v) => v.name && v.value)
          .map((v) => ({
            name: v.name,
            value: v.value,
            price: v.price ? parseFloat(v.price) : null,
            stockQuantity: parseInt(v.stock) || 0,
          })),
      }

      const url = isEditing ? `/api/seller/products?id=${product.id}` : '/api/seller/products'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/seller/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Product Name</label>
            <input aria-label="Form input" title="Form input"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-base"
              placeholder="e.g. Wireless Bluetooth Earbuds Pro"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Short Description</label>
            <input aria-label="Form input" title="Form input"
              type="text"
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
              className="input-base"
              placeholder="Brief product summary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Description</label>
            <textarea aria-label="Text area" title="Text area"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="input-base min-h-[120px] resize-y"
              placeholder="Detailed product description..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">SKU</label>
            <input aria-label="Form input" title="Form input"
              type="text"
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              className="input-base"
              placeholder="e.g. BLB-EAR-001"
              required
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Regular Price (৳)</label>
            <input aria-label="Form input" title="Form input"
              type="number"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="input-base"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sale Price (৳)</label>
            <input aria-label="Form input" title="Form input"
              type="number"
              value={form.salePrice}
              onChange={(e) => update('salePrice', e.target.value)}
              className="input-base"
              placeholder="Optional"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Cost Price (৳)</label>
            <input aria-label="Form input" title="Form input"
              type="number"
              value={form.costPrice}
              onChange={(e) => update('costPrice', e.target.value)}
              className="input-base"
              placeholder="Optional"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Stock Quantity</label>
            <input aria-label="Form input" title="Form input"
              type="number"
              value={form.stockQuantity}
              onChange={(e) => update('stockQuantity', e.target.value)}
              className="input-base"
              min="0"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Weight (grams)</label>
            <input aria-label="Form input" title="Form input"
              type="number"
              value={form.weight}
              onChange={(e) => update('weight', e.target.value)}
              className="input-base"
              placeholder="Optional"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Classification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <select aria-label="Select option" title="Select option"
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="input-base"
              required
            >
              <option value="">Select category</option>
              {parentCategories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  <option value={cat.id}>{cat.name}</option>
                  {childCategories
                    .filter((c) => c.parentId === cat.id)
                    .map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Brand</label>
            <select aria-label="Select option" title="Select option"
              value={form.brandId}
              onChange={(e) => update('brandId', e.target.value)}
              className="input-base"
            >
              <option value="">Select brand (optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Variants</h2>
          <button type="button" onClick={addVariant} className="btn-outline gap-1.5 text-xs px-3 py-1.5">
            <Plus className="size-3" /> Add Variant
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants added. Click above to add size, color, or other options.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input aria-label="Form input" title="Form input"
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                    className="input-base text-xs"
                    placeholder="e.g. Color"
                  />
                  <input aria-label="Form input" title="Form input"
                    type="text"
                    value={v.value}
                    onChange={(e) => updateVariant(idx, 'value', e.target.value)}
                    className="input-base text-xs"
                    placeholder="e.g. Black"
                  />
                  <input aria-label="Form input" title="Form input"
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                    className="input-base text-xs"
                    placeholder="Price override"
                  />
                  <input aria-label="Form input" title="Form input"
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                    className="input-base text-xs"
                    placeholder="Stock"
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove variant ${idx + 1}`}
                  title={`Remove variant ${idx + 1}`}
                  onClick={() => removeVariant(idx)}
                  className="p-1.5 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Meta Title</label>
            <input aria-label="Form input" title="Form input"
              type="text"
              value={form.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              className="input-base"
              placeholder="Defaults to product name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Meta Description</label>
            <textarea aria-label="Text area" title="Text area"
              value={form.metaDescription}
              onChange={(e) => update('metaDescription', e.target.value)}
              className="input-base min-h-[80px] resize-y"
              placeholder="Short description for search engines"
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Visibility</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { key: 'isActive', label: 'Published' },
            { key: 'isFeatured', label: 'Featured' },
            { key: 'isNew', label: 'Mark as New' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input aria-label="Form input" title="Form input"
                type="checkbox"
                checked={(form as any)[key]}
                onChange={(e) => update(key, e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
