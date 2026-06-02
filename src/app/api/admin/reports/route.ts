import { NextRequest, NextResponse } from 'next/server'
import { getAdminReportData, parseAdminReportRange } from '@/backend/admin/reports'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { toSafeClientError } from '@/backend/security/client-error'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()
    const { searchParams } = new URL(req.url)
    const range = parseAdminReportRange(searchParams.get('from'), searchParams.get('to'))
    const report = await getAdminReportData(range)

    return NextResponse.json(report)
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load reports')
    return NextResponse.json({ error: message }, { status })
  }
}
