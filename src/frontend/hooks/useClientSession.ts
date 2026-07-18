'use client'

import { useEffect, useState } from 'react'
import type { Session } from 'next-auth'

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

type SessionSnapshot = {
  data: Session | null
  status: SessionStatus
}

type UseClientSessionOptions = {
  delayMs?: number
}

let snapshot: SessionSnapshot = { data: null, status: 'loading' }
let sessionRequest: Promise<void> | null = null
let sessionLoadScheduled = false
let sessionLoadScheduledAt = Number.POSITIVE_INFINITY
let sessionLoadTimer: ReturnType<typeof setTimeout> | null = null
let sessionIdleCallback: number | null = null
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

function clearScheduledSessionLoad() {
  if (sessionLoadTimer !== null) {
    clearTimeout(sessionLoadTimer)
    sessionLoadTimer = null
  }

  if (
    sessionIdleCallback !== null &&
    typeof window !== 'undefined' &&
    'cancelIdleCallback' in window
  ) {
    window.cancelIdleCallback(sessionIdleCallback)
    sessionIdleCallback = null
  }

  sessionLoadScheduled = false
  sessionLoadScheduledAt = Number.POSITIVE_INFINITY
}

function scheduleSessionLoad(delayMs = 0) {
  if (sessionRequest || snapshot.status !== 'loading') return
  const scheduledAt = Date.now() + delayMs

  if (sessionLoadScheduled && scheduledAt >= sessionLoadScheduledAt) return
  if (sessionLoadScheduled) clearScheduledSessionLoad()

  sessionLoadScheduled = true
  sessionLoadScheduledAt = scheduledAt

  const run = () => {
    clearScheduledSessionLoad()
    if (snapshot.status === 'loading') void loadSession()
  }

  const scheduleIdle = () => {
    sessionLoadTimer = null

    if ('requestIdleCallback' in window) {
      sessionIdleCallback = window.requestIdleCallback(run, { timeout: 1200 })
      return
    }

    sessionLoadTimer = setTimeout(run, 150)
  }

  if (delayMs > 0) {
    sessionLoadTimer = setTimeout(scheduleIdle, delayMs)
  } else {
    scheduleIdle()
  }
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
export function useClientSession(options: UseClientSessionOptions = {}) {
  const [state, setState] = useState<SessionSnapshot>(snapshot)

  useEffect(() => {
    listeners.add(setState)
    scheduleSessionLoad(options.delayMs ?? 0)
    return () => {
      listeners.delete(setState)
    }
  }, [options.delayMs])

  return state
}
