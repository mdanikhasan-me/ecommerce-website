'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, Upload } from 'lucide-react'
import { AdminImageField } from './AdminImageField'
import { toSlug } from './form-utils'
import { getDescendantCategoryIds } from './category-utils'

const CATEGORY_IMAGE_DATA_URL_ERROR =
  'Category images must be uploaded as files before saving. Base64 image data is not allowed.'

function isCategoryImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}

type CategoryType = 'main' | 'sub'

interface CategoryOption {
  id: string
  name: string
  parentId: string | null
}

interface EditableCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  icon: string | null
  isActive: boolean
  sortOrder: number
  parentId: string | null
}

interface CategoryEditorFormProps {
  categories: CategoryOption[]
  category?: EditableCategory
  redirectTo?: string
}

function isUploadedSvgIcon(value: string | null | undefined) {
  const trimmed = value?.trim()
  return Boolean(trimmed && trimmed.startsWith('/assets/categories/subcategories/') && trimmed.toLowerCase().endsWith('.svg'))
}

export function CategoryEditorForm({
  categories,
  category,
  redirectTo = '/admin/categories',
}: CategoryEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(category)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [error, setError] = useState('')
  const [manualSlug, setManualSlug] = useState(Boolean(category))
  const [categoryType, setCategoryType] = useState<CategoryType>(category?.parentId ? 'sub' : 'main')
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    image: category?.image ?? '',
    icon: category?.icon ?? '',
    isActive: category?.isActive ?? true,
    sortOrder: String(category?.sortOrder ?? 0),
    parentId: category?.parentId ?? '',
  })

  const fieldIdPrefix = category ? `category-${category.id}` : 'category-new'
  const categoryId = category?.id

  useEffect(() => {
    if (!manualSlug) {
      setForm((current) => ({ ...current, slug: toSlug(current.name) }))
    }
  }, [form.name, manualSlug])

  const parentOptions = useMemo(
    () => {
      const topLevelOnly = categories.filter((item) => !item.parentId)
      if (!categoryId) return topLevelOnly

      const disallowedIds = getDescendantCategoryIds(categories, categoryId)
      disallowedIds.add(categoryId)

      return topLevelOnly.filter((item) => !disallowedIds.has(item.id))
    },
    [categories, categoryId],
  )

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const changeCategoryType = (next: CategoryType) => {
    setCategoryType(next)
    if (next === 'main') {
      // Main categories use a photo, not an icon.
      setForm((current) => ({ ...current, parentId: '', icon: '' }))
    } else {
      // Subcategories use an SVG icon, not a photo.
      setForm((current) => ({ ...current, image: '' }))
    }
  }

  const getCategoryUploadOwner = () =>
    form.slug.trim() || toSlug(form.name) || category?.slug || category?.id || 'category'

  const uploadCategoryImage = async (file: File) => {
    const uploadForm = new FormData()
    uploadForm.set('file', file)
    uploadForm.set('owner', getCategoryUploadOwner())

    const response = await fetch('/api/admin/categories/upload', { method: 'POST', body: uploadForm })
    const data = await response.json().catch(() => null)
    if (!response.ok || typeof data?.url !== 'string') {
      throw new Error(data?.error || 'Could not upload category image')
    }
    return data.url
  }

  const handleIconFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError('')
    setIsUploadingIcon(true)
    try {
      const uploadForm = new FormData()
      uploadForm.set('file', file)
      uploadForm.set('owner', getCategoryUploadOwner())
      uploadForm.set('kind', 'subcategory')

      const response = await fetch('/api/admin/categories/upload', { method: 'POST', body: uploadForm })
      const data = await response.json().catch(() => null)
      if (!response.ok || typeof data?.url !== 'string') {
        throw new Error(data?.error || 'Could not upload SVG icon')
      }
      updateField('icon', data.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload SVG icon')
    } finally {
      setIsUploadingIcon(false)
    }
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    image: categoryType === 'main' ? form.image.trim() || null : null,
    icon: categoryType === 'sub' ? form.icon.trim() || null : null,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder || 0),
    parentId: categoryType === 'sub' ? form.parentId || null : null,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (categoryType === 'sub' && !form.parentId) {
      setError('Choose a parent category for this subcategory.')
      return
    }

    if (categoryType === 'main' && isCategoryImageDataUrl(form.image)) {
      setError(CATEGORY_IMAGE_DATA_URL_ERROR)
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(
        isEditing ? `/api/admin/categories/${category!.id}` : '/api/admin/categories',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save category')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return
    if (!window.confirm('Delete this category? If it already has products or subcategories it will be disabled instead.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete category')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete category')
    } finally {
      setIsDeleting(false)
    }
  }

  const hasIcon = isUploadedSvgIcon(form.icon)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Category Details</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor={`${fieldIdPrefix}-name`} className="mb-1.5 block text-sm font-medium">Category name</label>
            <input id={`${fieldIdPrefix}-name`}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="input-base"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor={`${fieldIdPrefix}-slug`} className="mb-1.5 block text-sm font-medium">Slug</label>
              <input id={`${fieldIdPrefix}-slug`}
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
              <label htmlFor={`${fieldIdPrefix}-sort-order`} className="mb-1.5 block text-sm font-medium">Order number</label>
              <input id={`${fieldIdPrefix}-sort-order`}
                type="number"
                value={form.sortOrder}
                onChange={(event) => updateField('sortOrder', event.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label htmlFor={`${fieldIdPrefix}-type`} className="mb-1.5 block text-sm font-medium">Category type</label>
              <select id={`${fieldIdPrefix}-type`}
                value={categoryType}
                onChange={(event) => changeCategoryType(event.target.value as CategoryType)}
                className="input-base"
              >
                <option value="main">Main category (photo)</option>
                <option value="sub">Subcategory (SVG icon)</option>
              </select>
            </div>
          </div>

          {categoryType === 'sub' ? (
            <div>
              <label htmlFor={`${fieldIdPrefix}-parent`} className="mb-1.5 block text-sm font-medium">Parent category</label>
              <select id={`${fieldIdPrefix}-parent`}
                value={form.parentId}
                onChange={(event) => updateField('parentId', event.target.value)}
                className="input-base"
                required
              >
                <option value="">Select a parent category</option>
                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor={`${fieldIdPrefix}-description`} className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea id={`${fieldIdPrefix}-description`}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="input-base min-h-[120px] resize-y"
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

      <section className="rounded-md border border-border bg-card p-5">
        {categoryType === 'main' ? (
          <AdminImageField
            label="Category photo"
            value={form.image}
            onChange={(value) => updateField('image', value)}
            helperText="Main categories use a photo. Upload a local image; it is saved as a managed public path and used across the storefront."
            uploadImage={uploadCategoryImage}
            rejectDataUrls
            dataUrlErrorMessage={CATEGORY_IMAGE_DATA_URL_ERROR}
          />
        ) : (
          <div>
            <p className="text-sm font-medium">Subcategory icon (SVG)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Subcategories use an SVG icon to match the main-category icon style. Upload a single <code>.svg</code> file
              (max 64&nbsp;KB). It is saved to public assets and used on the storefront.
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/40">
                {hasIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.icon} alt="Subcategory icon preview" className="h-9 w-9" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No icon</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  aria-label="Upload subcategory SVG icon"
                  title="Upload subcategory SVG icon"
                  className="hidden"
                  onChange={handleIconFileChange}
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={isUploadingIcon}
                  className="btn-outline gap-2"
                >
                  {isUploadingIcon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {hasIcon ? 'Replace SVG' : 'Upload SVG'}
                </button>
                {hasIcon ? (
                  <button
                    type="button"
                    onClick={() => updateField('icon', '')}
                    className="btn-outline gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

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
              Delete category
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting || isUploadingIcon} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save category' : 'Create category'}
          </button>
        </div>
      </div>
    </form>
  )
}
