'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Settings2, Store, Warehouse } from 'lucide-react'
import toast from '@/frontend/lib/toast'
import { ariaPressed } from '@/frontend/components/ui/aria'

const SETTINGS_GROUPS = [
  {
    id: 'general',
    label: 'General',
    fields: [
      { key: 'site_name', label: 'Store Name', type: 'text' },
      { key: 'site_tagline', label: 'Tagline', type: 'text' },
      { key: 'site_email', label: 'Contact Email', type: 'email' },
      { key: 'site_phone', label: 'Contact Phone', type: 'text' },
      { key: 'site_address', label: 'Address', type: 'text' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    fields: [
      { key: 'low_stock_alert', label: 'Low Stock Threshold', type: 'number', description: 'Alert when stock falls below this number' },
    ],
  },
]

const EDITABLE_SETTING_KEYS = SETTINGS_GROUPS.flatMap((group) => group.fields.map((field) => field.key))
const GROUP_DETAILS = {
  general: {
    description: 'Store identity and customer-facing contact information.',
    icon: Store,
  },
  inventory: {
    description: 'Thresholds used to identify products that need restocking.',
    icon: Warehouse,
  },
} as const

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState('general')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Could not load settings')
        }
        setValues(data.settings ?? {})
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error, 'Could not load settings')))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const editableValues = Object.fromEntries(
        EDITABLE_SETTING_KEYS.map((key) => [key, values[key] ?? ''])
      )
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: editableValues }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }
      toast.success('Settings saved successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save settings'))
    } finally {
      setSaving(false)
    }
  }

  const currentGroup = SETTINGS_GROUPS.find((g) => g.id === activeGroup)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="admin-page-header items-center">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-description">Manage the store details used throughout customer and operations workflows.</p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="admin-card h-fit p-2.5">
          <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <Settings2 className="h-4 w-4" /> Configuration
          </div>
          <nav className="grid grid-cols-2 gap-1.5 lg:grid-cols-1" aria-label="Settings sections">
            {SETTINGS_GROUPS.map((group) => (
              <button type="button"
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-medium ${
                  activeGroup === group.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {group.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="admin-card p-4 sm:p-6 lg:p-7">
          {currentGroup ? (() => {
            const detail = GROUP_DETAILS[currentGroup.id as keyof typeof GROUP_DETAILS]
            const GroupIcon = detail.icon
            return (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <GroupIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h2 className="admin-section-title">{currentGroup.label}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail.description}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {currentGroup.fields.map((field) => (
                    <div key={field.key} className={field.key === 'site_address' ? 'sm:col-span-2' : ''}>
              <label htmlFor={`setting-${field.key}`} className="text-sm font-medium mb-1.5 block">
                {field.label}
              </label>
              {'description' in field && field.description && (
                <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
              )}
              {field.type === 'toggle' ? (
                <button type="button"
                  id={`setting-${field.key}`}
                  aria-label={`${values[field.key] === 'true' ? 'Disable' : 'Enable'} ${field.label}`}
                  {...ariaPressed(values[field.key] === 'true')}
                  title={`${values[field.key] === 'true' ? 'Disable' : 'Enable'} ${field.label}`}
                  onClick={() =>
                    setValues((v) => ({
                      ...v,
                      [field.key]: v[field.key] === 'true' ? 'false' : 'true',
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    values[field.key] === 'true' ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow ${
                      values[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <input
                  id={`setting-${field.key}`}
                  type={field.type}
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  className="input-base"
                />
              )}
                    </div>
                  ))}
                </div>
              </>
            )
          })() : null}
        </section>
      </div>
    </div>
  )
}
