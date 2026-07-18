'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react'
import type {
  AdminCategoryOption,
  AdminEditableProduct,
} from '@/backend/admin/product-editor'
import { createRowId, readFileAsDataUrl, toSlug } from './form-utils'
import {
  buildProductSearchCopy,
  isLegacyGeneratedProductDescription,
} from '@/backend/seo/product-copy'
import {
  ProductStructuredContentEditor,
  type ProductAttributeEditorValue,
  type ProductDescriptionImageEditorValue,
  type ProductFaqEditorValue,
  type ProductSpecificationEditorValue,
} from './ProductStructuredContentEditor'
import { splitProductStructuredContent } from '@/shared/product-content'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

interface ProductImageValue {
  id: string
  url: string
  alt: string
}

interface ProductVariantValue {
  id: string
  name: string
  sku: string
  options: Array<{
    id: string
    name: string
    value: string
  }>
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

export function ProductEditorForm({
  categories,
  officialStoreName,
  product,
  redirectTo = '/admin/products',
}: ProductEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(product)
  const isSetupReady = categories.length > 0 && Boolean(officialStoreName)
  const initialStructuredContent = splitProductStructuredContent(product?.specifications ?? [])

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [manualSlug, setManualSlug] = useState(Boolean(product))
  const [newImageUrl, setNewImageUrl] = useState('')

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    sku: product?.sku ?? '',
    basePrice: product?.basePrice?.toString() ?? '',
    salePrice: product?.salePrice?.toString() ?? '',
    costPrice: product?.costPrice?.toString() ?? '',
    stockQuantity: product?.stockQuantity?.toString() ?? '0',
    lowStockThreshold: product?.lowStockThreshold?.toString() ?? '5',
    weight: product?.weight?.toString() ?? '',
    categoryId: product?.categoryId ?? '',
    metaTitle: product?.metaTitle ?? '',
    metaDescription: isLegacyGeneratedProductDescription(product?.metaDescription, product?.name ?? '')
      ? ''
      : product?.metaDescription ?? '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
    isBestSeller: product?.isBestSeller ?? false,
    pinnedInNew: product?.pinnedInNew ?? false,
    pinnedInBestSeller: product?.pinnedInBestSeller ?? false,
    isPreOrder: product?.isPreOrder ?? false,
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
      options: variant.options?.map((option) => ({
        id: option.id ?? createRowId(),
        name: option.name ?? '',
        value: option.value ?? '',
      })) ?? [],
      price: variant.price?.toString() ?? '',
      salePrice: variant.salePrice?.toString() ?? '',
      stockQuantity: variant.stockQuantity?.toString() ?? '0',
      isActive: variant.isActive ?? true,
    })) ?? []
  )

  const [attributes, setAttributes] = useState<ProductAttributeEditorValue[]>(
    product?.attributes?.map((attribute) => ({
      id: attribute.id ?? createRowId(),
      name: attribute.name,
      value: attribute.value,
    })) ?? [],
  )
  const [specifications, setSpecifications] = useState<ProductSpecificationEditorValue[]>(
    initialStructuredContent.specifications.map((specification) => ({
      id: createRowId(),
      group: specification.group ?? '',
      name: specification.name,
      value: specification.value,
    })),
  )
  const [faqs, setFaqs] = useState<ProductFaqEditorValue[]>(
    initialStructuredContent.faqs.map((faq) => ({
      id: createRowId(),
      question: faq.question,
      answer: faq.answer,
    })),
  )
  const [descriptionImages, setDescriptionImages] = useState<ProductDescriptionImageEditorValue[]>(
    initialStructuredContent.descriptionImages.map((image) => ({
      id: createRowId(),
      url: image.url,
      alt: image.alt,
    })),
  )

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories]
  )

  const generatedSeo = useMemo(() => {
    const category = categories.find((item) => item.id === form.categoryId)
    return buildProductSearchCopy({
      name: form.name || 'Product',
      price: Number(form.salePrice || form.basePrice || 0),
      categoryName: category?.name,
      sku: form.sku,
      description: form.description,
      stockQuantity: Number(form.stockQuantity || 0),
      attributes: attributes.map(({ name, value }) => ({ name, value })),
      specifications: specifications.map(({ name, value }) => ({ name, value })),
      variantOptions: variants.flatMap((variant) =>
        variant.options.map(({ name, value }) => ({ name, value })),
      ),
    })
  }, [
    attributes,
    categories,
    form.basePrice,
    form.categoryId,
    form.description,
    form.name,
    form.salePrice,
    form.sku,
    form.stockQuantity,
    specifications,
    variants,
  ])

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
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Could not process selected image'))
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
        options: [{ id: createRowId(), name: '', value: '' }],
        price: '',
        salePrice: '',
        stockQuantity: '0',
        isActive: true,
      },
    ])
  }

  const updateVariant = (id: string, patch: Partial<ProductVariantValue>) => {
    setVariants((current) =>
      current.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant))
    )
  }

  const addVariantOption = (variantId: string) => {
    setVariants((current) => current.map((variant) => (
      variant.id === variantId
        ? { ...variant, options: [...variant.options, { id: createRowId(), name: '', value: '' }] }
        : variant
    )))
  }

  const updateVariantOption = (variantId: string, optionId: string, patch: { name?: string; value?: string }) => {
    setVariants((current) => current.map((variant) => (
      variant.id === variantId
        ? {
            ...variant,
            options: variant.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option)),
          }
        : variant
    )))
  }

  const removeVariantOption = (variantId: string, optionId: string) => {
    setVariants((current) => current.map((variant) => (
      variant.id === variantId
        ? { ...variant, options: variant.options.filter((option) => option.id !== optionId) }
        : variant
    )))
  }

  const removeVariant = (id: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== id))
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    shortDescription: null,
    sku: form.sku.trim(),
    basePrice: Number(form.basePrice),
    salePrice: form.salePrice ? Number(form.salePrice) : null,
    costPrice: form.costPrice ? Number(form.costPrice) : null,
    stockQuantity: Number(form.stockQuantity || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 5),
    weight: form.weight ? Number(form.weight) : null,
    categoryId: form.categoryId,
    metaTitle: form.metaTitle.trim() || null,
    metaDescription: form.metaDescription.trim() || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    isBestSeller: form.isBestSeller,
    pinnedInNew: form.isNew ? form.pinnedInNew : false,
    pinnedInBestSeller: form.isBestSeller ? form.pinnedInBestSeller : false,
    isPreOrder: form.isPreOrder,
    images: images
      .map((image) => ({
        url: image.url.trim(),
        alt: image.alt.trim(),
      }))
      .filter((image) => image.url),
    variants: variants
      .map((variant) => ({
        name: variant.name.trim() || null,
        sku: variant.sku.trim(),
        options: variant.options
          .map((option) => ({ name: option.name.trim(), value: option.value.trim() }))
          .filter((option) => option.name && option.value),
        price: variant.price ? Number(variant.price) : null,
        salePrice: variant.salePrice ? Number(variant.salePrice) : null,
        stockQuantity: Number(variant.stockQuantity || 0),
        isActive: variant.isActive,
      }))
      .filter((variant) => variant.sku && (variant.name || variant.options.length > 0)),
    attributes: attributes
      .map((attribute) => ({ name: attribute.name.trim(), value: attribute.value.trim() }))
      .filter((attribute) => attribute.name && attribute.value),
    specifications: specifications
      .map((specification) => ({
        group: specification.group.trim() || null,
        name: specification.name.trim(),
        value: specification.value.trim(),
      }))
      .filter((specification) => specification.name && specification.value),
    faqs: faqs
      .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
      .filter((faq) => faq.question && faq.answer),
    descriptionImages: descriptionImages
      .map((image) => ({ url: image.url.trim(), alt: image.alt.trim() }))
      .filter((image) => image.url && image.alt),
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
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Could not save product'))
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
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Could not delete product'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 sm:pb-0">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isSetupReady && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Products need at least one active category and a configured main store profile before they can be saved.
        </div>
      )}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="admin-card p-5">
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

            </div>
          </section>

          <ProductStructuredContentEditor
            description={form.description}
            onDescriptionChange={(value) => updateField('description', value)}
            attributes={attributes}
            onAttributesChange={setAttributes}
            specifications={specifications}
            onSpecificationsChange={setSpecifications}
            faqs={faqs}
            onFaqsChange={setFaqs}
            descriptionImages={descriptionImages}
            onDescriptionImagesChange={setDescriptionImages}
            onError={setError}
          />

          <section className="admin-card p-5">
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

            <div className="mt-4 rounded-md border border-border/70 bg-background/50 p-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  aria-label="Sell as pre-order"
                  title="Sell as pre-order"
                  type="checkbox"
                  checked={form.isPreOrder}
                  onChange={(event) => updateField('isPreOrder', event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Sell as pre-order
              </label>
              <p className="mt-1.5 pl-7 text-xs text-muted-foreground">
                Shows a Pre-order badge and replaces the stock label and buy button with pre-order wording. Stock quantity still limits how many units can be reserved.
              </p>
            </div>
          </section>

          <section className="admin-card p-5">
            <h2 className="font-display text-lg font-semibold">Images</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Recommended master: 3:2 • 1500 x 1000 px • WebP preferred • stored as WebP q88 • aim under 350 KB. Keep 6–10% clear space around the product; the storefront creates delivery variants automatically.</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground">
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
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {images.map((image, index) => (
                  <div key={image.id} className="rounded-lg bg-secondary/45 p-3">
                    <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <div className="aspect-[3/2] overflow-hidden rounded-md bg-card">
                        {image.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image.url} alt={image.alt || form.name || ''} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No preview
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
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

                        <div className="flex flex-wrap gap-2">
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
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Options and variants</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
                  Each card is one purchasable combination. Add one option row for each axis—for example Color: Black,
                  Storage: 256GB, and Region: USA. Create another card for every combination you sell.
                </p>
              </div>
              <button type="button" onClick={addVariant} className="btn-outline min-h-10 gap-2 px-3 text-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add combination
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No variants. Leave this empty for a product with one price and stock value.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {variants.map((variant, variantIndex) => (
                  <div key={variant.id} className="rounded-xl border border-border/70 bg-secondary/35 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                      <div>
                        <p className="text-sm font-semibold">Combination {variantIndex + 1}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {variant.options.filter((option) => option.name && option.value).map((option) => `${option.name}: ${option.value}`).join(' • ') || 'Add the option values for this combination.'}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeVariant(variant.id)} className="inline-flex min-h-10 items-center gap-2 px-2 text-xs font-medium text-red-600">
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove combination
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Combination label (optional)</label>
                        <input
                          value={variant.name}
                          onChange={(event) => updateVariant(variant.id, { name: event.target.value })}
                          className="input-base text-sm"
                          placeholder="Black / 256GB / USA"
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">Generated from option values when left blank.</p>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Variant SKU</label>
                        <input
                          value={variant.sku}
                          onChange={(event) => updateVariant(variant.id, { sku: event.target.value })}
                          className="input-base text-sm"
                          placeholder="PHONE-BLK-256-USA"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-lg bg-background/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Option values</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">Group is the selector name; value is what the customer chooses.</p>
                        </div>
                        <button type="button" onClick={() => addVariantOption(variant.id)} className="btn-outline min-h-10 gap-2 px-3 text-xs">
                          <Plus className="h-4 w-4" aria-hidden="true" /> Add option
                        </button>
                      </div>

                      <div className="mt-3 space-y-3">
                        {variant.options.map((option) => (
                          <div key={option.id} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Option group</label>
                              <input
                                value={option.name}
                                onChange={(event) => updateVariantOption(variant.id, option.id, { name: event.target.value })}
                                className="input-base text-sm"
                                placeholder="Color"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Option value</label>
                              <input
                                value={option.value}
                                onChange={(event) => updateVariantOption(variant.id, option.id, { value: event.target.value })}
                                className="input-base text-sm"
                                placeholder="Titanium Black"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              aria-label="Remove variant option"
                              title="Remove variant option"
                              onClick={() => removeVariantOption(variant.id, option.id)}
                              className="btn-outline min-h-11 self-end px-3 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price override</label>
                        <input type="number" min="0" step="0.01" value={variant.price} onChange={(event) => updateVariant(variant.id, { price: event.target.value })} className="input-base text-sm" placeholder="Uses base price" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sale price</label>
                        <input type="number" min="0" step="0.01" value={variant.salePrice} onChange={(event) => updateVariant(variant.id, { salePrice: event.target.value })} className="input-base text-sm" placeholder="Optional" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Variant stock</label>
                        <input type="number" min="0" value={variant.stockQuantity} onChange={(event) => updateVariant(variant.id, { stockQuantity: event.target.value })} className="input-base text-sm" />
                      </div>
                      <label className="flex min-h-11 items-center gap-2 self-end rounded-lg border border-border bg-background px-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) => updateVariant(variant.id, { isActive: event.target.checked })}
                          className="size-4 rounded border-input"
                        />
                        Available to customers
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card p-5">
            <h2 className="font-display text-lg font-semibold">Classification</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Search terms are generated automatically from the product name, SKU, and category. They stay hidden from customers and do not need manual maintenance.
            </p>
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

            </div>
          </section>

          <section className="admin-card p-5">
            <h2 className="font-display text-lg font-semibold">Visibility</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose which storefront sections show this product. Enable a section to reveal its pin-to-rotator option.
            </p>

            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  aria-label="Published"
                  title="Published"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField('isActive', event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Published
              </label>

              <div className="rounded-md border border-border/70 bg-background/50 p-3">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    aria-label="Show in Featured Products"
                    title="Show in Featured Products"
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => updateField('isFeatured', event.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Show in Featured Products
                </label>
              </div>

              <div className="rounded-md border border-border/70 bg-background/50 p-3">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    aria-label="Show in New Arrivals"
                    title="Show in New Arrivals"
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(event) => updateField('isNew', event.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Show in New Arrivals
                </label>
                {form.isNew ? (
                  <label className="mt-3 flex items-center gap-3 border-t border-border/60 pt-3 pl-1 text-xs text-muted-foreground">
                    <input
                      aria-label="Pin to New Arrivals rotator"
                      title="Pin to New Arrivals rotator"
                      type="checkbox"
                      checked={form.pinnedInNew}
                      onChange={(event) => updateField('pinnedInNew', event.target.checked)}
                      className="size-4 rounded border-input"
                    />
                    Pin to New Arrivals rotator (featured spotlight)
                  </label>
                ) : null}
              </div>

              <div className="rounded-md border border-border/70 bg-background/50 p-3">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    aria-label="Show in Best Sellers"
                    title="Show in Best Sellers"
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(event) => updateField('isBestSeller', event.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Show in Best Sellers
                </label>
                {form.isBestSeller ? (
                  <label className="mt-3 flex items-center gap-3 border-t border-border/60 pt-3 pl-1 text-xs text-muted-foreground">
                    <input
                      aria-label="Pin to Best Sellers rotator"
                      title="Pin to Best Sellers rotator"
                      type="checkbox"
                      checked={form.pinnedInBestSeller}
                      onChange={(event) => updateField('pinnedInBestSeller', event.target.checked)}
                      className="size-4 rounded border-input"
                    />
                    Pin to Best Sellers rotator (featured spotlight)
                  </label>
                ) : null}
              </div>
            </div>
          </section>

          <section className="admin-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">SEO</h2>
              <button
                type="button"
                onClick={() => setForm((current) => ({
                  ...current,
                  metaTitle: generatedSeo.title,
                  metaDescription: generatedSeo.description,
                }))}
                className="btn-outline px-3 py-2 text-xs"
              >
                Regenerate SEO copy
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Automatically builds Bangladesh-focused search copy from the product name, price, category, SKU, highlights, specifications, variants, and stock.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium">Meta title (optional override)</label>
                  <span className="text-[11px] text-muted-foreground">
                    {(form.metaTitle.trim() || generatedSeo.title).length}/70
                  </span>
                </div>
                <input aria-label="Form input" title="Form input"
                  value={form.metaTitle}
                  onChange={(event) => updateField('metaTitle', event.target.value)}
                  className="input-base"
                  placeholder={generatedSeo.title}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium">Meta description (optional override)</label>
                  <span className="text-[11px] text-muted-foreground">
                    {(form.metaDescription.trim() || generatedSeo.description).length}/180
                  </span>
                </div>
                <textarea aria-label="Text area" title="Text area"
                  value={form.metaDescription}
                  onChange={(event) => updateField('metaDescription', event.target.value)}
                  className="input-base min-h-[100px] resize-y"
                  placeholder={generatedSeo.description}
                />
              </div>

              <div className="rounded-md border border-dashed border-border bg-background/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Auto-SEO preview</p>
                <div className="mt-2 space-y-2 text-xs">
                  <p>
                    <span className="font-semibold">Title: </span>
                    <span className="text-foreground/90">
                      {form.metaTitle.trim() || (form.name ? generatedSeo.title : 'Not set')}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Description: </span>
                    <span className="text-foreground/80">
                      {form.metaDescription.trim() ||
                        (form.name
                          ? generatedSeo.description
                          : 'Not set')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">Automatic discovery terms</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Generated for product discovery and metadata; never shown on the storefront.
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    {generatedSeo.searchTerms.length} terms
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {generatedSeo.searchTerms.slice(0, 14).map((term) => (
                    <span
                      key={term}
                      className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground/80"
                    >
                      {term}
                    </span>
                  ))}
                  {generatedSeo.searchTerms.length > 14 ? (
                    <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      +{generatedSeo.searchTerms.length - 14} more
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="admin-form-actions flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
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
