import { NextRequest, NextResponse } from 'next/server'
import { buildAdminReportCsv, parseAdminReportRange } from '@/backend/admin/reports'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { toSafeClientError } from '@/backend/security/client-error'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (!type || !['orders', 'products', 'customers'].includes(type)) {
      return NextResponse.json({ error: 'Export type is invalid' }, { status: 400 })
    }

    const range = parseAdminReportRange(searchParams.get('from'), searchParams.get('to'))
    const csv = await buildAdminReportCsv(type as 'orders' | 'products' | 'customers', range)
    const timestamp = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}-report-${timestamp}.csv"`,
      },
    })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not export report')
    return NextResponse.json({ error: message }, { status })
  }
}
