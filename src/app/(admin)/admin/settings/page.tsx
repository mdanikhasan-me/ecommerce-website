'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

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
    id: 'features',
    label: 'Feature Flags',
    fields: [
      { key: 'guest_checkout', label: 'Allow Guest Checkout', type: 'toggle', description: 'Let customers checkout without creating an account' },
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

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState('general')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { setValues(data.settings ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
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
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Settings</h1>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {SETTINGS_GROUPS.map((group) => (
              <button type="button"
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeGroup === group.id
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {group.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Fields */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-base">{currentGroup?.label}</h2>
          {currentGroup?.fields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
              {'description' in field && field.description && (
                <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
              )}
              {field.type === 'toggle' ? (
                <button type="button"
                  aria-label={`${values[field.key] === 'true' ? 'Disable' : 'Enable'} ${field.label}`}
                  aria-pressed={values[field.key] === 'true'}
                  title={`${values[field.key] === 'true' ? 'Disable' : 'Enable'} ${field.label}`}
                  onClick={() =>
                    setValues((v) => ({
                      ...v,
                      [field.key]: v[field.key] === 'true' ? 'false' : 'true',
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    values[field.key] === 'true' ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      values[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <input aria-label="Form input" title="Form input"
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
      </div>
    </div>
  )
}
