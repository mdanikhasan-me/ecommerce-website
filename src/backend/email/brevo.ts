import type { EnabledEmailConfig } from '@/backend/email/config'
import { isSafeHeaderValue, isValidEmailAddress } from '@/backend/email/sanitize'
import type {
  EmailErrorCategory,
  EmailProviderResult,
  TransactionalEmailMessage,
  TransactionalEmailProvider,
} from '@/backend/email/types'

// Official endpoint: https://developers.brevo.com/docs/send-a-transactional-email
const BREVO_SEND_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'
const REQUEST_TIMEOUT_MS = 10_000

type BrevoFetch = typeof fetch

function failure(category: EmailErrorCategory, retryable: boolean, safeError: string): EmailProviderResult {
  return { ok: false, category, retryable, safeError }
}

function categorizeHttpStatus(status: number, bodyText: string): EmailProviderResult {
  if (status === 401 || status === 403) {
    return failure('authentication', true, 'Provider rejected the API credentials.')
  }
  if (status === 429) {
    return failure('rate_limited', true, 'Provider rate limit reached.')
  }
  if (status === 408 || status >= 500) {
    return failure('temporary_provider_failure', true, `Provider returned status ${status}.`)
  }
  if (status === 400) {
    // Inspect only a bounded, lowercased copy; never store the raw body.
    const hint = bodyText.slice(0, 400).toLowerCase()
    if (/(invalid|not valid|malformed).{0,40}(email|recipient|to\b)|recipient.{0,40}invalid/.test(hint)) {
      return failure('invalid_recipient', false, 'Provider rejected the recipient address.')
    }
    return failure('permanent_provider_rejection', false, 'Provider rejected the request as invalid.')
  }
  return failure('unknown', true, `Provider returned unexpected status ${status}.`)
}

export class BrevoEmailProvider implements TransactionalEmailProvider {
  readonly name = 'brevo'

  constructor(
    private readonly config: EnabledEmailConfig,
    private readonly fetchImpl: BrevoFetch = fetch,
  ) {}

  async send(message: TransactionalEmailMessage): Promise<EmailProviderResult> {
    if (!isValidEmailAddress(message.to.email)) {
      return failure('invalid_recipient', false, 'Recipient address failed validation.')
    }
    if (!isSafeHeaderValue(message.subject)) {
      return failure('template_error', false, 'Subject failed header-safety validation.')
    }
    if (message.to.name !== undefined && !isSafeHeaderValue(message.to.name)) {
      return failure('template_error', false, 'Recipient name failed header-safety validation.')
    }

    const body = {
      sender: { name: this.config.fromName, email: this.config.fromAddress },
      to: [message.to.name ? { email: message.to.email, name: message.to.name } : { email: message.to.email }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      ...(message.replyTo?.email && isValidEmailAddress(message.replyTo.email)
        ? { replyTo: { email: message.replyTo.email } }
        : {}),
      ...(message.tags && message.tags.length > 0 ? { tags: message.tags.slice(0, 5) } : {}),
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await this.fetchImpl(BREVO_SEND_ENDPOINT, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': this.config.brevoApiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
      })

      if (response.status === 201 || response.status === 200 || response.status === 202) {
        let providerMessageId: string | null = null
        try {
          const parsed = (await response.json()) as { messageId?: unknown }
          if (typeof parsed.messageId === 'string' && parsed.messageId.length <= 200) {
            providerMessageId = parsed.messageId
          }
        } catch {
          providerMessageId = null
        }
        return { ok: true, providerMessageId }
      }

      const bodyText = await response.text().catch(() => '')
      return categorizeHttpStatus(response.status, bodyText)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return failure('timeout', true, 'Provider request timed out.')
      }
      return failure('temporary_provider_failure', true, 'Provider request failed before a response.')
    } finally {
      clearTimeout(timeout)
    }
  }
}
