'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'

interface EditableHomepageSection {
  id: string
  type: string
  title: string | null
  subtitle: string | null
  config: unknown
  isActive: boolean
  sortOrder: number
}

interface HomepageSectionEditorFormProps {
  section?: EditableHomepageSection
  redirectTo?: string
}

interface HomepageSectionFormState {
  type: string
  title: string
  subtitle: string
  config: string
  isActive: boolean
  sortOrder: string
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function HomepageSectionEditorForm({
  section,
  redirectTo = '/admin/content',
}: HomepageSectionEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(section)
  const fieldIdPrefix = section ? `homepage-section-${section.id}` : 'homepage-section-new'

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<HomepageSectionFormState>({
    type: section?.type ?? '',
    title: section?.title ?? '',
    subtitle: section?.subtitle ?? '',
    config: section?.config ? JSON.stringify(section.config, null, 2) : '',
    isActive: section?.isActive ?? true,
    sortOrder: String(section?.sortOrder ?? 0),
  })

  const updateField = <Field extends keyof HomepageSectionFormState>(
    field: Field,
    value: HomepageSectionFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    type: form.type.trim(),
    title: form.title.trim() || null,
    subtitle: form.subtitle.trim() || null,
    config: form.config.trim() || null,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder || 0),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEditing ? `/api/admin/content/${section!.id}` : '/api/admin/content',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save section')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, 'Could not save section'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!section) return
    if (!window.confirm('Delete this homepage section?')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/content/${section.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not delete section')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (deleteError: unknown) {
      setError(getErrorMessage(deleteError, 'Could not delete section'))
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
            <h2 className="font-display text-lg font-semibold">Section Details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-type`} className="mb-1.5 block text-sm font-medium">
                  Type
                </label>
                <input
                  id={`${fieldIdPrefix}-type`}
                  value={form.type}
                  onChange={(event) => updateField('type', event.target.value)}
                  className="input-base"
                  placeholder="featured_categories"
                  required
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-title`} className="mb-1.5 block text-sm font-medium">
                  Title
                </label>
                <input
                  id={`${fieldIdPrefix}-title`}
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-subtitle`} className="mb-1.5 block text-sm font-medium">
                  Subtitle
                </label>
                <input
                  id={`${fieldIdPrefix}-subtitle`}
                  value={form.subtitle}
                  onChange={(event) => updateField('subtitle', event.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-config`} className="mb-1.5 block text-sm font-medium">
                  Config JSON
                </label>
                <textarea
                  id={`${fieldIdPrefix}-config`}
                  value={form.config}
                  onChange={(event) => updateField('config', event.target.value)}
                  className="input-base min-h-[260px] resize-y font-mono text-xs"
                  placeholder='{"key":"value"}'
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Visibility</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-sort-order`} className="mb-1.5 block text-sm font-medium">
                  Sort order
                </label>
                <input
                  id={`${fieldIdPrefix}-sort-order`}
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => updateField('sortOrder', event.target.value)}
                  className="input-base"
                />
              </div>
              <label htmlFor={`${fieldIdPrefix}-is-active`} className="flex items-center gap-3 text-sm">
                <input
                  id={`${fieldIdPrefix}-is-active`}
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
              Delete section
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(redirectTo)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? 'Save section' : 'Create section'}
          </button>
        </div>
      </div>
    </form>
  )
}
