'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { AdminImageField } from './AdminImageField'
import { toSlug } from './form-utils'
import { getDescendantCategoryIds } from './category-utils'

const CATEGORY_IMAGE_DATA_URL_ERROR =
  'Category images must be uploaded as files before saving. Base64 image data is not allowed.'

function isCategoryImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}

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

export function CategoryEditorForm({
  categories,
  category,
  redirectTo = '/admin/categories',
}: CategoryEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(category)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [manualSlug, setManualSlug] = useState(Boolean(category))
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
      if (!categoryId) return categories

      const disallowedIds = getDescendantCategoryIds(categories, categoryId)
      disallowedIds.add(categoryId)

      return categories.filter((item) => !disallowedIds.has(item.id))
    },
    [categories, categoryId],
  )

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    image: form.image.trim() || null,
    icon: form.icon.trim() || null,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder || 0),
    parentId: form.parentId || null,
  })

  const getCategoryUploadOwner = () =>
    form.slug.trim() || toSlug(form.name) || category?.slug || category?.id || 'category'

  const uploadCategoryImage = async (file: File) => {
    const uploadForm = new FormData()
    uploadForm.set('file', file)
    uploadForm.set('owner', getCategoryUploadOwner())

    const response = await fetch('/api/admin/categories/upload', {
      method: 'POST',
      body: uploadForm,
    })
    const data = await response.json().catch(() => null)

    if (!response.ok || typeof data?.url !== 'string') {
      throw new Error(data?.error || 'Could not upload category image')
    }

    return data.url
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (isCategoryImageDataUrl(form.image)) {
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
            <h2 className="font-display text-lg font-semibold">Category Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-name`} className="mb-1.5 block text-sm font-medium">Name</label>
                <input id={`${fieldIdPrefix}-name`}
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="input-base"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                  <label htmlFor={`${fieldIdPrefix}-sort-order`} className="mb-1.5 block text-sm font-medium">Sort order</label>
                  <input id={`${fieldIdPrefix}-sort-order`}
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => updateField('sortOrder', event.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldIdPrefix}-description`} className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea id={`${fieldIdPrefix}-description`}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="input-base min-h-[140px] resize-y"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <AdminImageField
              label="Category image"
              value={form.image}
              onChange={(value) => updateField('image', value)}
              helperText="Upload a local image. The saved value stays as a managed public path."
              uploadImage={uploadCategoryImage}
              rejectDataUrls
              dataUrlErrorMessage={CATEGORY_IMAGE_DATA_URL_ERROR}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Structure</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-parent`} className="mb-1.5 block text-sm font-medium">Parent category</label>
                <select id={`${fieldIdPrefix}-parent`}
                  value={form.parentId}
                  onChange={(event) => updateField('parentId', event.target.value)}
                  className="input-base"
                >
                  <option value="">Top level category</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.parentId ? `${item.name} subcategory` : item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${fieldIdPrefix}-icon`} className="mb-1.5 block text-sm font-medium">Icon label</label>
                <input id={`${fieldIdPrefix}-icon`}
                  value={form.icon}
                  onChange={(event) => updateField('icon', event.target.value)}
                  className="input-base"
                  placeholder="Optional icon keyword"
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
              Delete category
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save category' : 'Create category'}
          </button>
        </div>
      </div>
    </form>
  )
}
