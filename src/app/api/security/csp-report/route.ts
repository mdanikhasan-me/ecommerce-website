import { NextRequest, NextResponse } from 'next/server'

import { isCspReportCollectionEnabled } from '@/backend/security/csp'
import {
  MAX_CSP_REPORT_BODY_BYTES,
  sanitizeCspReportPayload,
} from '@/backend/security/csp-report'
import { logSecurityEvent } from '@/backend/security/security-log'

const ACCEPTED_CONTENT_TYPES = [
  'application/csp-report',
  'application/json',
]

function isAcceptedContentType(value: string | null) {
  if (!value) return false
  const normalized = value.split(';')[0]?.trim().toLowerCase()
  return ACCEPTED_CONTENT_TYPES.includes(normalized)
}

async function readBoundedBody(req: NextRequest) {
  const body = await req.text()
  const byteLength = new TextEncoder().encode(body).byteLength

  if (byteLength > MAX_CSP_REPORT_BODY_BYTES) {
    return { tooLarge: true as const, body: '' }
  }

  return { tooLarge: false as const, body }
}

export async function POST(req: NextRequest) {
  if (!isCspReportCollectionEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!isAcceptedContentType(req.headers.get('content-type'))) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  }

  const { tooLarge, body } = await readBoundedBody(req)
  if (tooLarge) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
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
