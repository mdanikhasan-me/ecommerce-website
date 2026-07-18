import { NextRequest, NextResponse } from 'next/server'

import { isCspReportCollectionEnabled } from '@/backend/security/csp'
import {
  MAX_CSP_REPORT_BODY_BYTES,
  sanitizeCspReportPayload,
} from '@/backend/security/csp-report'
import { logSecurityEvent } from '@/backend/security/security-log'
import { readBoundedTextBody } from '@/backend/security/request-body'
import { rateLimit } from '@/backend/security/rate-limit'

const ACCEPTED_CONTENT_TYPES = [
  'application/csp-report',
  'application/json',
]

function isAcceptedContentType(value: string | null) {
  if (!value) return false
  const normalized = value.split(';')[0]?.trim().toLowerCase()
  return ACCEPTED_CONTENT_TYPES.includes(normalized)
}

export async function POST(req: NextRequest) {
  if (!isCspReportCollectionEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const limited = rateLimit(req, { key: 'security:csp-report', limit: 60, windowMs: 60_000 })
  if (limited) return limited

  if (!isAcceptedContentType(req.headers.get('content-type'))) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  }

  const body = await readBoundedTextBody(req, MAX_CSP_REPORT_BODY_BYTES)
  if (!body.success) return body.response

  let parsed: unknown
  try {
    parsed = JSON.parse(body.data)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const sanitizedReport = sanitizeCspReportPayload(parsed)
  if (!sanitizedReport) {
    return NextResponse.json({ error: 'Invalid CSP report' }, { status: 400 })
  }

  logSecurityEvent({
    type: 'csp_violation_report',
    severity: 'warn',
    route: req.nextUrl.pathname,
    method: req.method,
    statusCode: 204,
    metadata: sanitizedReport,
  })

  return new NextResponse(null, { status: 204 })
}
