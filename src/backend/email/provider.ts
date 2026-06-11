import { BrevoEmailProvider } from '@/backend/email/brevo'
import type { EmailConfig } from '@/backend/email/config'
import type { EmailProviderResult, TransactionalEmailMessage, TransactionalEmailProvider } from '@/backend/email/types'

/**
 * Used whenever sending is not configured. Queued events stay pending —
 * intentionally disabled email must never mark outbox records as failed.
 */
export class DisabledEmailProvider implements TransactionalEmailProvider {
  readonly name = 'disabled'

  async send(_message: TransactionalEmailMessage): Promise<EmailProviderResult> {
    return {
      ok: false,
      category: 'disabled',
      retryable: false,
      safeError: 'Email sending is disabled by configuration.',
    }
  }
}

export function getEmailProvider(config: EmailConfig): TransactionalEmailProvider {
  if (!config.enabled) return new DisabledEmailProvider()
  return new BrevoEmailProvider(config)
}
