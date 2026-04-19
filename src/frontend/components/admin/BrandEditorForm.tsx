'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { AdminImageField } from './AdminImageField'
import { toSlug } from './form-utils'

interface EditableBrand {
  id: string
  name: string
  slug: string
  logo: string | null
  banner: string | null
  description: string | null
  website: string | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
}

interface BrandEditorFormProps {
  brand?: EditableBrand
  redirectTo?: string
}

export function BrandEditorForm({
  brand,
  redirectTo = '/admin/brands',
}: BrandEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(brand)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [manualSlug, setManualSlug] = useState(Boolean(brand))
  const [form, setForm] = useState({
    name: brand?.name ?? '',
    slug: brand?.slug ?? '',
    logo: brand?.logo ?? '',
    banner: brand?.banner ?? '',
    description: brand?.description ?? '',
    website: brand?.website ?? '',
    isActive: brand?.isActive ?? true,
    isFeatured: brand?.isFeatured ?? false,
    sortOrder: String(brand?.sortOrder ?? 0),
  })

  useEffect(() => {
    if (!manualSlug) {
      setForm((current) => ({ ...current, slug: toSlug(current.name) }))
    }
  }, [form.name, manualSlug])

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    logo: form.logo.trim() || null,
    banner: form.banner.trim() || null,
    description: form.description.trim() || null,
    website: form.website.trim() || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder || 0),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/brands/${brand!.id}` : '/api/admin/brands',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save brand')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError: any) {
      setError(submitError.message || 'Could not save brand')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!brand) return
    if (!window.confirm('Delete this brand? Linked brands will be hidden instead of fully removed.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete brand')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError: any) {
      setError(deleteError.message || 'Could not delete brand')
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
            <h2 className="font-display text-lg font-semibold">Brand Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
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
                  <label className="mb-1.5 block text-sm font-medium">Sort order</label>
                  <input aria-label="Form input" title="Form input"
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => updateField('sortOrder', event.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Website</label>
                <input aria-label="Form input" title="Form input"
                  type="url"
                  value={form.website}
                  onChange={(event) => updateField('website', event.target.value)}
                  className="input-base"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea aria-label="Text area" title="Text area"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="input-base min-h-[160px] resize-y"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <AdminImageField
              label="Brand logo"
              value={form.logo}
              onChange={(value) => updateField('logo', value)}
            />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <AdminImageField
              label="Brand banner"
              value={form.banner}
              onChange={(value) => updateField('banner', value)}
            />
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
              <label className="flex items-center gap-3 text-sm">
                <input aria-label="Form input" title="Form input"
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => updateField('isFeatured', event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Featured
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
              Delete brand
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save brand' : 'Create brand'}
          </button>
        </div>
      </div>
    </form>
  )
}
