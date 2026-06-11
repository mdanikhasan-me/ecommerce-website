import { escapeEmailHtml } from '@/backend/email/sanitize'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

const BRAND_NAME = 'Boilabin'
const COLOR_BACKGROUND = '#f5f1ea'
const COLOR_CARD = '#fffdfa'
const COLOR_TEXT = '#231f1a'
const COLOR_MUTED = '#6f675d'
const COLOR_BORDER = '#e6dfd4'
const COLOR_ACCENT = '#2c2440'

export type EmailLayoutInput = {
  title: string
  /** Pre-escaped/safe HTML produced by a template in this module. */
  bodyHtml: string
  /** Short hidden preview line shown by inbox clients. Plain text. */
  preheader?: string
}

/**
 * Shared transactional shell: table layout, inline styles, no remote
 * JavaScript, no remote images, no tracking pixels.
 */
export function renderEmailLayout(input: EmailLayoutInput): string {
  const title = escapeEmailHtml(input.title)
  const preheader = escapeEmailHtml(input.preheader ?? '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_BACKGROUND};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR_BACKGROUND};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${COLOR_CARD};border:1px solid ${COLOR_BORDER};border-radius:12px;overflow:hidden;">
<tr><td style="padding:24px 28px 16px 28px;border-bottom:1px solid ${COLOR_BORDER};">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:${COLOR_ACCENT};letter-spacing:0.5px;">${BRAND_NAME}</span>
</td></tr>
<tr><td style="padding:24px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${COLOR_TEXT};">
${input.bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px 24px 28px;border-top:1px solid ${COLOR_BORDER};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${COLOR_MUTED};">
This is an order-service message from ${BRAND_NAME}.<br>
Need help? Contact <a href="mailto:${escapeEmailHtml(CONTACT_EMAIL)}" style="color:${COLOR_ACCENT};">${escapeEmailHtml(CONTACT_EMAIL)}</a> or call ${escapeEmailHtml(CONTACT_PHONE)}.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export function renderTextLayout(lines: string[]): string {
  return [
    BRAND_NAME,
    '='.repeat(BRAND_NAME.length),
    '',
    ...lines,
    '',
    '--',
    `This is an order-service message from ${BRAND_NAME}.`,
    `Need help? Contact ${CONTACT_EMAIL} or call ${CONTACT_PHONE}.`,
  ].join('\n')
}

export const emailLayoutColors = {
  background: COLOR_BACKGROUND,
  card: COLOR_CARD,
  text: COLOR_TEXT,
  muted: COLOR_MUTED,
  border: COLOR_BORDER,
  accent: COLOR_ACCENT,
} as const

export function renderEmailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;"><tr><td style="border-radius:999px;background-color:${COLOR_ACCENT};">
<a href="${escapeEmailHtml(href)}" style="display:inline-block;padding:11px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeEmailHtml(label)}</a>
</td></tr></table>`
}

export function renderKeyValueRows(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([key, value]) =>
        `<tr><td width="1%" style="padding:4px 12px 4px 0;color:${COLOR_MUTED};white-space:nowrap;vertical-align:top;">${escapeEmailHtml(key)}</td><td style="padding:4px 0;color:${COLOR_TEXT};word-break:break-word;">${escapeEmailHtml(value)}</td></tr>`,
    )
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">${body}</table>`
}
