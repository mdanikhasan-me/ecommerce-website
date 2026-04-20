'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react'
import type {
  AdminCategoryOption,
  AdminEditableProduct,
} from '@/backend/admin/product-editor'

interface ProductImageValue {
  id: string
  url: string
  alt: string
}

interface ProductVariantValue {
  id: string
  name: string
  sku: string
  optionName: string
  optionValue: string
  price: string
  salePrice: string
  stockQuantity: string
  isActive: boolean
}

interface ProductEditorFormProps {
  categories: AdminCategoryOption[]
  officialStoreName: string
  product?: AdminEditableProduct
  redirectTo?: string
}

function createRowId() {
  return Math.random().toString(36).slice(2, 10)
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function ProductEditorForm({
  categories,
  officialStoreName,
  product,
  redirectTo = '/admin/products',
}: ProductEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(product)
  const isSetupReady = categories.length > 0 && Boolean(officialStoreName)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [manualSlug, setManualSlug] = useState(Boolean(product))
  const [newImageUrl, setNewImageUrl] = useState('')

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    shortDescription: product?.shortDescription ?? '',
    sku: product?.sku ?? '',
    basePrice: product?.basePrice?.toString() ?? '',
    salePrice: product?.salePrice?.toString() ?? '',
    costPrice: product?.costPrice?.toString() ?? '',
    stockQuantity: product?.stockQuantity?.toString() ?? '0',
    lowStockThreshold: product?.lowStockThreshold?.toString() ?? '5',
    weight: product?.weight?.toString() ?? '',
    categoryId: product?.categoryId ?? '',
    brandName: product?.brandName ?? '',
    tags: Array.isArray(product?.tags) ? product.tags.join(', ') : '',
    metaTitle: product?.metaTitle ?? '',
    metaDescription: product?.metaDescription ?? '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
    isBestSeller: product?.isBestSeller ?? false,
  })

  const [images, setImages] = useState<ProductImageValue[]>(
    product?.images?.map((image) => ({
      id: createRowId(),
      url: image.url,
      alt: image.alt ?? '',
    })) ?? []
  )

  const [variants, setVariants] = useState<ProductVariantValue[]>(
    product?.variants?.map((variant) => ({
      id: variant.id ?? createRowId(),
      name: variant.name ?? '',
      sku: variant.sku ?? '',
      optionName: variant.options?.[0]?.name ?? '',
      optionValue: variant.options?.[0]?.value ?? '',
      price: variant.price?.toString() ?? '',
      salePrice: variant.salePrice?.toString() ?? '',
      stockQuantity: variant.stockQuantity?.toString() ?? '0',
      isActive: variant.isActive ?? true,
    })) ?? []
  )

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories]
  )

  useEffect(() => {
    if (!manualSlug) {
      setForm((current) => ({ ...current, slug: toSlug(current.name) }))
    }
  }, [form.name, manualSlug])

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const addImageRow = () => {
    if (!newImageUrl.trim()) return
    setImages((current) => [
      ...current,
      {
        id: createRowId(),
        url: newImageUrl.trim(),
        alt: '',
      },
    ])
    setNewImageUrl('')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => ({
          id: createRowId(),
          url: await readFileAsDataUrl(file),
          alt: file.name.replace(/\.[^.]+$/, ''),
        }))
      )

      setImages((current) => [...current, ...uploadedImages])
    } catch (uploadError: any) {
      setError(uploadError.message || 'Could not process selected image')
    } finally {
      event.target.value = ''
    }
  }

  const updateImage = (id: string, field: 'url' | 'alt', value: string) => {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, [field]: value } : image))
    )
  }

  const removeImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id))
  }

  const makePrimaryImage = (id: string) => {
    setImages((current) => {
      const selected = current.find((image) => image.id === id)
      if (!selected) return current
      return [selected, ...current.filter((image) => image.id !== id)]
    })
  }

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        id: createRowId(),
        name: '',
        sku: '',
        optionName: '',
        optionValue: '',
        price: '',
        salePrice: '',
        stockQuantity: '0',
        isActive: true,
      },
    ])
  }

  const updateVariant = (id: string, field: keyof ProductVariantValue, value: string | boolean) => {
    setVariants((current) =>
      current.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant))
    )
  }

  const removeVariant = (id: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== id))
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim() || null,
    sku: form.sku.trim(),
    basePrice: Number(form.basePrice),
    salePrice: form.salePrice ? Number(form.salePrice) : null,
    costPrice: form.costPrice ? Number(form.costPrice) : null,
    stockQuantity: Number(form.stockQuantity || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 5),
    weight: form.weight ? Number(form.weight) : null,
    categoryId: form.categoryId,
    brandName: form.brandName.trim() || null,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    metaTitle: form.metaTitle.trim() || null,
    metaDescription: form.metaDescription.trim() || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    isBestSeller: form.isBestSeller,
    images: images
      .map((image) => ({
        url: image.url.trim(),
        alt: image.alt.trim(),
      }))
      .filter((image) => image.url),
    variants: variants
      .map((variant) => ({
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        optionName: variant.optionName.trim(),
        optionValue: variant.optionValue.trim(),
        price: variant.price ? Number(variant.price) : null,
        salePrice: variant.salePrice ? Number(variant.salePrice) : null,
        stockQuantity: Number(variant.stockQuantity || 0),
        isActive: variant.isActive,
      }))
      .filter((variant) => variant.name && variant.sku),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isSetupReady) {
      setError('Add at least one active category and make sure the main store profile is configured before saving products.')
      return
    }
    if (isEditing && !product?.id) {
      setError('Product data is missing. Reload the page and try again.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/products/${product?.id}` : '/api/admin/products',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save product')
      }

      router.replace(redirectTo)
    } catch (submitError: any) {
      setError(submitError.message || 'Could not save product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing || !product?.id) return
    if (!window.confirm('Delete this product? If the product is linked to orders, it will be archived instead.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete product')
      }

      router.replace(redirectTo)
    } catch (deleteError: any) {
      setError(deleteError.message || 'Could not delete product')
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

      {!isSetupReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Products need at least one active category and a configured main store profile before they can be saved.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Basic Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Product name</label>
                <input aria-label="Form input" title="Form input"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="input-base"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Slug</label>
                  <input aria-label="Form input" title="Form input"
                    value={form.slug}
                    onChange={(event) => {
                      setManualSlug(true)
                      updateField('slug', event.target.value)
                    }}
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">SKU</label>
                  <input aria-label="Form input" title="Form input"
                    value={form.sku}
                    onChange={(event) => updateField('sku', event.target.value)}
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Short description</label>
                <input aria-label="Form input" title="Form input"
                  value={form.shortDescription}
                  onChange={(event) => updateField('shortDescription', event.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea aria-label="Text area" title="Text area"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="input-base min-h-[160px] resize-y"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Pricing and Inventory</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Base price</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(event) => updateField('basePrice', event.target.value)}
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Sale price</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(event) => updateField('salePrice', event.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Cost price</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(event) => updateField('costPrice', event.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Stock quantity</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(event) => updateField('stockQuantity', event.target.value)}
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Low stock threshold</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(event) => updateField('lowStockThreshold', event.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Weight in grams</label>
                <input aria-label="Form input" title="Form input"
                  type="number"
                  min="0"
                  value={form.weight}
                  onChange={(event) => updateField('weight', event.target.value)}
                  className="input-base"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Images</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80">
                <Upload className="h-4 w-4" />
                Upload files
                <input aria-label="Form input" title="Form input" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>

              <div className="flex min-w-[260px] flex-1 gap-2">
                <input aria-label="Form input" title="Form input"
                  value={newImageUrl}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  className="input-base"
                  placeholder="Paste image URL"
                />
                <button type="button" onClick={addImageRow} className="btn-outline gap-2 whitespace-nowrap">
                  <ImagePlus className="h-4 w-4" />
                  Add URL
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No product images added yet.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {images.map((image, index) => (
                  <div key={image.id} className="rounded-2xl border border-border bg-secondary/40 p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-card">
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image.url} alt={image.alt || form.name || ''} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Image URL
                        </label>
                        <input aria-label="Form input" title="Form input"
                          value={image.url}
                          onChange={(event) => updateImage(image.id, 'url', event.target.value)}
                          className="input-base text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Alt text
                        </label>
                        <input aria-label="Form input" title="Form input"
                          value={image.alt}
                          onChange={(event) => updateImage(image.id, 'alt', event.target.value)}
                          className="input-base text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        {index !== 0 && (
                          <button type="button" onClick={() => makePrimaryImage(image.id)} className="btn-outline px-3 py-2 text-xs">
                            Make primary
                          </button>
                        )}
                        <button type="button" onClick={() => removeImage(image.id)} className="btn-outline px-3 py-2 text-xs text-red-600">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Variants</h2>
              <button type="button" onClick={addVariant} className="btn-outline gap-2 px-3 py-2 text-xs">
                <Plus className="h-4 w-4" />
                Add variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No variants added.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="rounded-2xl border border-border bg-secondary/40 p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <input aria-label="Form input" title="Form input"
                        value={variant.name}
                        onChange={(event) => updateVariant(variant.id, 'name', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Variant name"
                      />
                      <input aria-label="Form input" title="Form input"
                        value={variant.sku}
                        onChange={(event) => updateVariant(variant.id, 'sku', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Variant SKU"
                      />
                      <input aria-label="Form input" title="Form input"
                        value={variant.optionName}
                        onChange={(event) => updateVariant(variant.id, 'optionName', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Option name"
                      />
                      <input aria-label="Form input" title="Form input"
                        value={variant.optionValue}
                        onChange={(event) => updateVariant(variant.id, 'optionValue', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Option value"
                      />
                      <input aria-label="Form input" title="Form input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) => updateVariant(variant.id, 'price', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Price override"
                      />
                      <input aria-label="Form input" title="Form input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.salePrice}
                        onChange={(event) => updateVariant(variant.id, 'salePrice', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Sale price"
                      />
                      <input aria-label="Form input" title="Form input"
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(event) => updateVariant(variant.id, 'stockQuantity', event.target.value)}
                        className="input-base text-sm"
                        placeholder="Stock"
                      />
                      <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm">
                        <input aria-label="Form input" title="Form input"
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) => updateVariant(variant.id, 'isActive', event.target.checked)}
                          className="size-4 rounded border-input"
                        />
                        Active
                      </label>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => removeVariant(variant.id)} className="btn-outline px-3 py-2 text-xs text-red-600">
                        Remove variant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Classification</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Category</label>
                <select aria-label="Select option" title="Select option"
                  value={form.categoryId}
                  onChange={(event) => updateField('categoryId', event.target.value)}
                  className="input-base"
                  required
                >
                  <option value="">Select category</option>
                  {topLevelCategories.map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name}</option>
                      {categories
                        .filter((category) => category.parentId === parent.id)
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
                <label className="mb-1.5 block text-sm font-medium">Brand name</label>
                <input aria-label="Form input" title="Form input"
                  value={form.brandName}
                  onChange={(event) => updateField('brandName', event.target.value)}
                  className="input-base"
                  placeholder="Type brand name manually"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Type the brand directly. A matching brand will be reused, or a new one will be created automatically.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Tags</label>
                <input aria-label="Form input" title="Form input"
                  value={form.tags}
                  onChange={(event) => updateField('tags', event.target.value)}
                  className="input-base"
                  placeholder="comma, separated, tags"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Visibility</h2>
            <div className="mt-4 space-y-3">
              {[
                ['isActive', 'Published'],
                ['isFeatured', 'Featured'],
                ['isNew', 'New arrival'],
                ['isBestSeller', 'Best seller'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 text-sm">
                  <input aria-label="Form input" title="Form input"
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(event) => updateField(key, event.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">SEO</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Meta title</label>
                <input aria-label="Form input" title="Form input"
                  value={form.metaTitle}
                  onChange={(event) => updateField('metaTitle', event.target.value)}
                  className="input-base"
                  placeholder={`${form.name || 'Product name'} price in Bangladesh`}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Leave blank to generate this dynamically from the product name and current price.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Meta description</label>
                <textarea aria-label="Text area" title="Text area"
                  value={form.metaDescription}
                  onChange={(event) => updateField('metaDescription', event.target.value)}
                  className="input-base min-h-[120px] resize-y"
                />
              </div>
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
              Delete product
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting || !isSetupReady} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>
    </form>
  )
}
