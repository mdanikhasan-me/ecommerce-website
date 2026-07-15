'use client'

import { useEffect, useState } from 'react'
import type { Session } from 'next-auth'

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

type SessionSnapshot = {
  data: Session | null
  status: SessionStatus
}

let snapshot: SessionSnapshot = { data: null, status: 'loading' }
let sessionRequest: Promise<void> | null = null
let sessionLoadScheduled = false
const listeners = new Set<(value: SessionSnapshot) => void>()

function publish(value: SessionSnapshot) {
  snapshot = value
  listeners.forEach((listener) => listener(value))
}

function loadSession() {
  if (sessionRequest) return sessionRequest

  sessionRequest = fetch('/api/auth/session', {
    cache: 'no-store',
    credentials: 'same-origin',
  })
    .then(async (response) => {
      if (!response.ok) {
        publish({ data: null, status: 'unauthenticated' })
        return
      }

      const session = await response.json().catch(() => null) as Session | null
      publish({
        data: session?.user ? session : null,
        status: session?.user ? 'authenticated' : 'unauthenticated',
      })
    })
    .catch(() => {
      publish({ data: null, status: 'unauthenticated' })
    })
    .finally(() => {
      sessionRequest = null
    })

  return sessionRequest
}

function scheduleSessionLoad() {
  if (sessionLoadScheduled || sessionRequest || snapshot.status !== 'loading') return
  sessionLoadScheduled = true

  const run = () => {
    sessionLoadScheduled = false
    if (snapshot.status === 'loading') void loadSession()
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1200 })
    return
  }

  setTimeout(run, 150)
}

export async function getClientSession() {
  if (snapshot.status === 'loading') await loadSession()
  return snapshot.data
}

export async function refreshClientSession() {
  if (sessionRequest) await sessionRequest
  await loadSession()

  return snapshot.data
}

/** A single cached session request for public storefront islands. */
export function useClientSession() {
  const [state, setState] = useState<SessionSnapshot>(snapshot)

  useEffect(() => {
    listeners.add(setState)
    scheduleSessionLoad()
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return state
}
