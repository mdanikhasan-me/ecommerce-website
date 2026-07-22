'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import toast from '@/frontend/lib/toast'

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

const emptyAddressForm: AddressForm = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', division: '', postalCode: '', isDefault: false,
}

function addressToForm(address: Address): AddressForm {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    district: address.district,
    division: address.division,
    postalCode: address.postalCode ?? '',
    isDefault: address.isDefault,
  }
}

export function AddressManager({ addresses: initial }: { addresses: Address[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(true)
  const [editing, setEditing] = useState<Address | null>(initial[0] ?? null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState<AddressForm>(() => initial[0] ? addressToForm(initial[0]) : emptyAddressForm)

  const resetForm = () => {
    setForm(emptyAddressForm)
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (addr: Address) => {
    setForm(addressToForm(addr))
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
    <section className="grid border-y border-border lg:grid-cols-[minmax(19rem,0.62fr)_minmax(0,1.38fr)]">
      <aside className="py-5 lg:py-6 lg:pr-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Saved addresses ({initial.length})</h2>
        <div className="mt-3 divide-y divide-border">
          {initial.map((addr) => (
            <article key={addr.id} className={`relative py-5 pl-4 pr-3 ${editing?.id === addr.id ? 'before:absolute before:inset-y-4 before:left-0 before:w-1 before:bg-foreground' : ''}`}>
              <div className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary/55"><LocalIcon name="map-pin" className="h-5 w-5" /></span>
                <button type="button" onClick={() => startEdit(addr)} className="min-w-0 flex-1 text-left" aria-label={`Edit address for ${addr.fullName}`}>
                  <span className="flex flex-wrap items-center gap-2"><strong className="text-sm font-semibold">{addr.fullName}</strong>{addr.isDefault ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span> : null}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />{addr.city}, {addr.district}{addr.postalCode ? ` ${addr.postalCode}` : ''}<br />{addr.phone}</span>
                </button>
                <div className="flex shrink-0 items-start gap-1 pt-1">
                  <button type="button" onClick={() => startEdit(addr)} className="px-1.5 py-1 text-sm font-medium" aria-label={`Edit address for ${addr.fullName}`}>Edit</button>
                  <span className="mt-1.5 h-4 border-l border-border" />
                  <button type="button" onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id} className="px-1.5 py-1 text-sm font-medium text-destructive" aria-label={`Delete address for ${addr.fullName}`}>{deletingId === addr.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</button>
                </div>
              </div>
            </article>
          ))}
          {initial.length === 0 ? <div className="px-4 py-8 text-center text-sm text-muted-foreground">No addresses saved yet.</div> : null}
        </div>
        <button type="button" onClick={() => { setForm(emptyAddressForm); setEditing(null); setShowForm(true) }} className="mt-4 inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold"><LocalIcon name="plus" className="h-5 w-5" /> Add new address</button>
      </aside>

      <div className="border-t border-border py-5 lg:border-l lg:border-t-0 lg:py-6 lg:pl-6">
        {showForm ? (
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-semibold tracking-[-0.02em]">{editing ? 'Edit Address' : 'Add Address'}</h2>{editing?.isDefault ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Default address</span> : null}</div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground"
              aria-label="Close address form"
              title="Close address form"
            >
              <LocalIcon name="x" className="size-4" />
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
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <LocalIcon name="check" className="size-4" />}
                {editing ? 'Save changes' : 'Save address'}
              </button>
            </div>
          </form>
          </div>
        ) : null}
      </div>
    </section>
  )
}
