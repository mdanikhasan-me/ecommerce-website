import { randomUUID } from 'crypto'
import type { EmailEventType, EmailOutboxStatus } from '@prisma/client'
import { getEmailAppUrl, getEmailConfig, type EmailConfig } from '@/backend/email/config'
import { getEmailProvider } from '@/backend/email/provider'
import { isValidEmailAddress } from '@/backend/email/sanitize'
import { renderEmailForOutbox } from '@/backend/email/templates'
import type { EmailErrorCategory, TransactionalEmailProvider } from '@/backend/email/types'
import { db } from '@/backend/database'
import { logSecurityEvent } from '@/backend/security/security-log'

/** Bounded exponential backoff after each failed attempt (1m, 5m, 30m, 2h, 12h). */
export const EMAIL_RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000, 7_200_000, 43_200_000] as const

/** PROCESSING rows older than this are treated as abandoned by a crashed worker. */
export const EMAIL_LOCK_TIMEOUT_MS = 15 * 60 * 1000

export const EMAIL_PROCESSOR_DEFAULT_BATCH = 10

export type EmailOutboxJob = {
  id: string
  eventType: EmailEventType
  recipient: string
  payload: unknown
  attemptCount: number
  maxAttempts: number
}

/** Minimal database surface so the processor is fully testable in isolation. */
export type EmailProcessorDb = {
  emailOutbox: {
    findMany: (args: {
      where: object
      orderBy: object
      take: number
      select: object
    }) => Promise<Array<Partial<EmailOutboxJob> & { id: string }>>
    updateMany: (args: { where: object; data: object }) => Promise<{ count: number }>
  }
}

export type EmailProcessSummary = {
  disabled: boolean
  claimed: number
  sent: number
  retried: number
  dead: number
}

export function getRetryDelayMs(attemptCount: number): number {
  const index = Math.min(Math.max(attemptCount - 1, 0), EMAIL_RETRY_DELAYS_MS.length - 1)
  return EMAIL_RETRY_DELAYS_MS[index]
}

function dueWhere(now: Date) {
  return {
    OR: [
      { status: { in: ['PENDING', 'RETRY'] as EmailOutboxStatus[] }, nextAttemptAt: { lte: now } },
      { status: 'PROCESSING' as EmailOutboxStatus, lockedAt: { lt: new Date(now.getTime() - EMAIL_LOCK_TIMEOUT_MS) } },
    ],
  }
}

export async function processDueEmails(options: {
  database?: EmailProcessorDb
  provider?: TransactionalEmailProvider
  config?: EmailConfig
  appUrl?: string
  batchSize?: number
  now?: Date
} = {}): Promise<EmailProcessSummary> {
  const config = options.config ?? getEmailConfig()

  if (!config.enabled) {
    // Intentionally disabled email leaves queued events untouched.
    return { disabled: true, claimed: 0, sent: 0, retried: 0, dead: 0 }
  }

  const database = options.database ?? (db as unknown as EmailProcessorDb)
  const provider = options.provider ?? getEmailProvider(config)
  const appUrl = options.appUrl ?? getEmailAppUrl()
  const batchSize = Math.min(Math.max(options.batchSize ?? EMAIL_PROCESSOR_DEFAULT_BATCH, 1), 25)
  const now = options.now ?? new Date()
  const lockToken = randomUUID()

  // Two-step atomic claim: candidates are locked with a conditional updateMany
  // so concurrent processors can never claim the same row.
  const candidates = await database.emailOutbox.findMany({
    where: dueWhere(now),
    orderBy: { nextAttemptAt: 'asc' },
    take: batchSize,
    select: { id: true },
  })

  if (candidates.length === 0) {
    return { disabled: false, claimed: 0, sent: 0, retried: 0, dead: 0 }
  }

  await database.emailOutbox.updateMany({
    where: { id: { in: candidates.map((candidate) => candidate.id) }, ...dueWhere(now) },
    data: { status: 'PROCESSING', lockedAt: now, lockToken },
  })

  const claimedJobs = (await database.emailOutbox.findMany({
    where: { lockToken, status: 'PROCESSING' },
    orderBy: { nextAttemptAt: 'asc' },
    take: batchSize,
    select: {
      id: true,
      eventType: true,
      recipient: true,
      payload: true,
      attemptCount: true,
      maxAttempts: true,
    },
  })) as EmailOutboxJob[]

  let sent = 0
  let retried = 0
  let dead = 0

  for (const job of claimedJobs) {
    const outcome = await sendOutboxJob(job, { provider, config, appUrl })

    if (outcome.kind === 'sent') {
      sent += 1
      await database.emailOutbox.updateMany({
        where: { id: job.id, lockToken },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerMessageId: outcome.providerMessageId,
          lockToken: null,
          lockedAt: null,
          attemptCount: job.attemptCount + 1,
          lastErrorCode: null,
          lastSafeError: null,
        },
      })
      continue
    }

    const attemptCount = job.attemptCount + 1
    const exhausted = attemptCount >= job.maxAttempts
    const isDead = !outcome.retryable || exhausted

    if (isDead) {
      dead += 1
    } else {
      retried += 1
    }

    await database.emailOutbox.updateMany({
      where: { id: job.id, lockToken },
      data: {
        status: isDead ? 'DEAD' : 'RETRY',
        attemptCount,
        nextAttemptAt: new Date(Date.now() + getRetryDelayMs(attemptCount)),
        lockToken: null,
        lockedAt: null,
        lastErrorCode: outcome.category,
        lastSafeError: outcome.safeError.slice(0, 200),
      },
    })

    if (outcome.category === 'authentication' || outcome.category === 'configuration') {
      logSecurityEvent({
        type: 'email_provider_configuration_failure',
        severity: 'error',
        errorCode: outcome.category,
        metadata: { feature: 'email_outbox' },
      })
    }
  }

  return { disabled: false, claimed: claimedJobs.length, sent, retried, dead }
}

type SendOutcome =
  | { kind: 'sent'; providerMessageId: string | null }
  | { kind: 'failed'; category: EmailErrorCategory; retryable: boolean; safeError: string }

async function sendOutboxJob(
  job: EmailOutboxJob,
  context: { provider: TransactionalEmailProvider; config: EmailConfig; appUrl: string },
): Promise<SendOutcome> {
  if (!isValidEmailAddress(job.recipient)) {
    return {
      kind: 'failed',
      category: 'invalid_recipient',
      retryable: false,
      safeError: 'Stored recipient failed validation.',
    }
  }

  let rendered
  try {
    rendered = renderEmailForOutbox(job.eventType, job.payload, context.appUrl)
  } catch {
    return {
      kind: 'failed',
      category: 'template_error',
      retryable: false,
      safeError: 'Stored payload could not be rendered.',
    }
  }

  const replyTo = context.config.enabled && context.config.replyTo ? { email: context.config.replyTo } : undefined
  const result = await context.provider.send({
    to: { email: job.recipient },
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    ...(replyTo ? { replyTo } : {}),
    tags: [`boilabin-${job.eventType.toLowerCase().replace(/_/g, '-')}`],
  })

  if (result.ok) {
    return { kind: 'sent', providerMessageId: result.providerMessageId }
  }

  return { kind: 'failed', category: result.category, retryable: result.retryable, safeError: result.safeError }
}
