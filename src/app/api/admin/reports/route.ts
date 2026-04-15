import { NextRequest, NextResponse } from 'next/server'
import { getAdminReportData, parseAdminReportRange } from '@/backend/admin/reports'
import { requireAdminSession } from '@/backend/admin/admin-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()
    const { searchParams } = new URL(req.url)
    const range = parseAdminReportRange(searchParams.get('from'), searchParams.get('to'))
    const report = await getAdminReportData(range)

    return NextResponse.json(report)
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not load reports' }, { status })
  }
}
