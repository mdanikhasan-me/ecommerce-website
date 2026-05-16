'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

type ReturnRequestButtonProps = {
  orderId: string
  disabled: boolean
  disabledReason: string
}

export function ReturnRequestButton({ orderId, disabled, disabledReason }: ReturnRequestButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('Wrong or defective item')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason, description }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not request return')
      toast.success('Return request submitted')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not request return')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        title={disabled ? disabledReason : 'Request return'}
        className="btn-outline w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        Request Return
      </button>
      {disabled ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{disabledReason}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="font-display text-lg font-semibold">Request a return</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Returns are accepted within 7 days after delivery.
            </p>

            <label htmlFor="return-reason" className="mt-5 block text-sm font-medium">
              Reason
            </label>
            <select
              id="return-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="input-base mt-1.5"
            >
              <option>Wrong or defective item</option>
              <option>Damaged on arrival</option>
              <option>Different from description</option>
              <option>Missing accessories</option>
              <option>Other</option>
            </select>

            <label htmlFor="return-description" className="mt-4 block text-sm font-medium">
              Details
            </label>
            <textarea
              id="return-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Tell us what happened..."
              className="input-base mt-1.5 resize-none"
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" className="btn-outline flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1" onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
