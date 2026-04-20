'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { AdminImageField } from './AdminImageField'
import { toDateTimeLocalValue } from './form-utils'

interface EditableBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  mobileImageUrl: string | null
  linkUrl: string | null
  position: string
  sortOrder: number
  isActive: boolean
  startsAt: string | Date | null
  endsAt: string | Date | null
}

interface BannerEditorFormProps {
  banner?: EditableBanner
  redirectTo?: string
}

export function BannerEditorForm({
  banner,
  redirectTo = '/admin/banners',
}: BannerEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(banner)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: banner?.title ?? '',
    subtitle: banner?.subtitle ?? '',
    imageUrl: banner?.imageUrl ?? '',
    mobileImageUrl: banner?.mobileImageUrl ?? '',
    linkUrl: banner?.linkUrl ?? '',
    position: banner?.position ?? 'hero',
    sortOrder: String(banner?.sortOrder ?? 0),
    isActive: banner?.isActive ?? true,
    startsAt: toDateTimeLocalValue(banner?.startsAt),
    endsAt: toDateTimeLocalValue(banner?.endsAt),
  })

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    imageUrl: form.imageUrl.trim(),
    mobileImageUrl: form.mobileImageUrl.trim() || null,
    linkUrl: form.linkUrl.trim() || null,
    position: form.position.trim() || 'hero',
    sortOrder: Number(form.sortOrder || 0),
    isActive: form.isActive,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/banners/${banner!.id}` : '/api/admin/banners',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save banner')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError: any) {
      setError(submitError.message || 'Could not save banner')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!banner) return
    if (!window.confirm('Delete this banner?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete banner')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError: any) {
      setError(deleteError.message || 'Could not delete banner')
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
            <h2 className="font-display text-lg font-semibold">Banner Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Title</label>
                <p className="mb-1.5 text-xs text-muted-foreground">Leave empty to hide the large headline on the storefront.</p>
                <input aria-label="Form input" title="Form input"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="input-base"
                  placeholder="Optional banner title"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Subtitle</label>
                <p className="mb-1.5 text-xs text-muted-foreground">Leave empty to hide the smaller supporting text.</p>
                <input aria-label="Form input" title="Form input"
                  value={form.subtitle}
                  onChange={(event) => updateField('subtitle', event.target.value)}
                  className="input-base"
                  placeholder="Optional supporting text"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Link URL</label>
                <input aria-label="Form input" title="Form input"
                  value={form.linkUrl}
                  onChange={(event) => updateField('linkUrl', event.target.value)}
                  className="input-base"
                  placeholder="/category or https://example.com"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <AdminImageField
              label="Desktop image"
              value={form.imageUrl}
              onChange={(value) => updateField('imageUrl', value)}
              helperText="Shown on tablet and desktop. Remove it if you want a text-only banner there."
            />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <AdminImageField
              label="Mobile image"
              value={form.mobileImageUrl}
              onChange={(value) => updateField('mobileImageUrl', value)}
              helperText="Optional phone-only artwork. If empty, the desktop image is reused on mobile."
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Placement</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Position</label>
                <input aria-label="Form input" title="Form input"
                  value={form.position}
                  onChange={(event) => updateField('position', event.target.value)}
                  className="input-base"
                  placeholder="hero"
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
              <div>
                <label className="mb-1.5 block text-sm font-medium">Starts at</label>
                <input aria-label="Form input" title="Form input"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => updateField('startsAt', event.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Ends at</label>
                <input aria-label="Form input" title="Form input"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(event) => updateField('endsAt', event.target.value)}
                  className="input-base"
                />
              </div>
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
              Delete banner
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save banner' : 'Create banner'}
          </button>
        </div>
      </div>
    </form>
  )
}
