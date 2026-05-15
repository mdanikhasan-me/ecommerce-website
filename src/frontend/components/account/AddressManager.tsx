'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, MapPin, Loader2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Address {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  division: string
  postalCode: string | null
  isDefault: boolean
}

type AddressForm = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  district: string
  division: string
  postalCode: string
  isDefault: boolean
}

export function AddressManager({ addresses: initial }: { addresses: Address[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState<AddressForm>({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', division: '', postalCode: '', isDefault: false,
  })

  const resetForm = () => {
    setForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', division: '', postalCode: '', isDefault: false })
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '', city: addr.city, district: addr.district, division: addr.division,
      postalCode: addr.postalCode ?? '', isDefault: addr.isDefault,
    })
    setEditing(addr)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/account/addresses/${editing.id}` : '/api/account/addresses'
      await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Could not save address')
        }
      })
      resetForm()
      router.refresh()
      toast.success(editing ? 'Address updated' : 'Address saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save address')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Could not delete address')
      }
      router.refresh()
      toast.success('Address deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete address')
    } finally {
      setDeletingId(null)
    }
  }

  const update = <Field extends keyof AddressForm>(field: Field, value: AddressForm[Field]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
  const formIdPrefix = editing ? `address-form-${editing.id}` : 'address-form-new'

  return (
    <div>
      {/* Address List */}
      {initial.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <MapPin className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-semibold text-lg mb-2">No addresses saved</h2>
          <p className="text-muted-foreground text-sm mb-6">Add a shipping address to speed up checkout</p>
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary gap-2"><Plus className="size-4" /> Add Address</button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {initial.map((addr) => (
              <div key={addr.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-sm text-muted-foreground">{addr.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.district}, {addr.division} {addr.postalCode}</p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(addr)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    aria-label={`Edit address for ${addr.fullName}`}
                    title={`Edit address for ${addr.fullName}`}
                  >
                    <Pencil className="size-3.5 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label={`Delete address for ${addr.fullName}`}
                    title={`Delete address for ${addr.fullName}`}
                  >
                    {deletingId === addr.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5 text-red-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-outline gap-2 w-full"><Plus className="size-4" /> Add New Address</button>
          )}
        </>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">{editing ? 'Edit Address' : 'New Address'}</h2>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg hover:bg-secondary"
              aria-label="Close address form"
              title="Close address form"
            >
              <X className="size-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${formIdPrefix}-fullName`} className="text-sm font-medium mb-1.5 block">Full Name</label>
                <input id={`${formIdPrefix}-fullName`} type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="input-base" required />
              </div>
              <div>
                <label htmlFor={`${formIdPrefix}-phone`} className="text-sm font-medium mb-1.5 block">Phone</label>
                <input id={`${formIdPrefix}-phone`} type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-base" required />
              </div>
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-addressLine1`} className="text-sm font-medium mb-1.5 block">Address Line 1</label>
              <input id={`${formIdPrefix}-addressLine1`} type="text" value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} className="input-base" required />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-addressLine2`} className="text-sm font-medium mb-1.5 block">Address Line 2 (optional)</label>
              <input id={`${formIdPrefix}-addressLine2`} type="text" value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)} className="input-base" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label htmlFor={`${formIdPrefix}-city`} className="text-sm font-medium mb-1.5 block">City</label>
                <input id={`${formIdPrefix}-city`} type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-base" required />
              </div>
              <div>
                <label htmlFor={`${formIdPrefix}-district`} className="text-sm font-medium mb-1.5 block">District</label>
                <input id={`${formIdPrefix}-district`} type="text" value={form.district} onChange={(e) => update('district', e.target.value)} className="input-base" required />
              </div>
              <div>
                <label htmlFor={`${formIdPrefix}-division`} className="text-sm font-medium mb-1.5 block">Division</label>
                <input id={`${formIdPrefix}-division`} type="text" value={form.division} onChange={(e) => update('division', e.target.value)} className="input-base" required />
              </div>
              <div>
                <label htmlFor={`${formIdPrefix}-postalCode`} className="text-sm font-medium mb-1.5 block">Postal Code</label>
                <input id={`${formIdPrefix}-postalCode`} type="text" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-base" />
              </div>
            </div>
            <label htmlFor={`${formIdPrefix}-isDefault`} className="flex items-center gap-2 cursor-pointer">
              <input id={`${formIdPrefix}-isDefault`} type="checkbox" checked={form.isDefault} onChange={(e) => update('isDefault', e.target.checked)} className="rounded border-input text-primary focus:ring-primary size-4" />
              <span className="text-sm">Set as default address</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {editing ? 'Update' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
