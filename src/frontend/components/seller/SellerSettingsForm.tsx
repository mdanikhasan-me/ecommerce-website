'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Store } from 'lucide-react'

interface SellerSettingsFormProps {
  seller: {
    id: string
    storeName: string
    slug: string
    description: string | null
    logo: string | null
    banner: string | null
    phone: string | null
    returnPolicy: string | null
    shippingPolicy: string | null
    address: string | null
  }
}

export function SellerSettingsForm({ seller }: SellerSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    storeName: seller.storeName,
    description: seller.description ?? '',
    phone: seller.phone ?? '',
    address: seller.address ?? '',
    returnPolicy: seller.returnPolicy ?? '',
    shippingPolicy: seller.shippingPolicy ?? '',
  })

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      setSaved(true)
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
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg border border-green-200">Settings saved successfully</div>
      )}

      {/* Store Profile */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Store className="size-4" /> Store Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Store Name</label>
            <input type="text" value={form.storeName} onChange={(e) => update('storeName', e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Store URL</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-2.5 rounded-l-lg border border-r-0 border-input">boilabin.com/store/</span>
              <input type="text" value={seller.slug} disabled className="input-base rounded-l-none opacity-60 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-base min-h-[100px] resize-y" placeholder="Describe your store..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Contact Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-base" placeholder="+880..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Business Address</label>
              <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="input-base" placeholder="City, Country" />
            </div>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-display font-semibold mb-4">Policies</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Return Policy</label>
            <textarea value={form.returnPolicy} onChange={(e) => update('returnPolicy', e.target.value)} className="input-base min-h-[80px] resize-y" placeholder="Describe your return policy..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Shipping Policy</label>
            <textarea value={form.shippingPolicy} onChange={(e) => update('shippingPolicy', e.target.value)} className="input-base min-h-[80px] resize-y" placeholder="Describe your shipping process..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Settings
        </button>
      </div>
    </form>
  )
}
