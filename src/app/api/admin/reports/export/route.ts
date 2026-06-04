import { NextRequest, NextResponse } from 'next/server'
import {
  buildAdminExportSecurityEvent,
  isAdminReportExportType,
  type AdminExportAuditEventInput,
} from '@/backend/admin/export-audit-log'
import { buildAdminReportCsv, parseAdminReportRange } from '@/backend/admin/reports'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { toSafeClientError } from '@/backend/security/client-error'
import { logSecurityEvent } from '@/backend/security/security-log'

function logAdminExportAudit(input: AdminExportAuditEventInput) {
  try {
    logSecurityEvent(buildAdminExportSecurityEvent(input))
  } catch {
    // Export audit logging is fail-open so CSV responses keep their existing behavior.
  }
}

export async function GET(req: NextRequest) {
  let reportTypeForAudit: AdminExportAuditEventInput['reportType']

  try {
    const session = await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (!isAdminReportExportType(type)) {
      logAdminExportAudit({
        result: 'blocked',
        statusCode: 400,
        errorCode: 'invalid_export_type',
        actorRole: session.user.role,
      })

      return NextResponse.json({ error: 'Export type is invalid' }, { status: 400 })
    }

    reportTypeForAudit = type
    const range = parseAdminReportRange(searchParams.get('from'), searchParams.get('to'))
    const csv = await buildAdminReportCsv(type, range)
    const timestamp = new Date().toISOString().slice(0, 10)

    logAdminExportAudit({
      result: 'success',
      reportType: reportTypeForAudit,
      statusCode: 200,
      actorRole: session.user.role,
    })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}-report-${timestamp}.csv"`,
      },
    })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not export report')
    logAdminExportAudit({
      result: status === 401 ? 'blocked' : 'failed',
      reportType: reportTypeForAudit,
      statusCode: status,
      errorCode: status === 401 ? 'unauthorized' : 'export_failed',
    })

    return NextResponse.json({ error: message }, { status })
  }
}
