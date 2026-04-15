import { NextRequest, NextResponse } from 'next/server'
import { buildAdminReportCsv, parseAdminReportRange } from '@/backend/admin/reports'
import { requireAdminSession } from '@/backend/admin/admin-utils'

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
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not export report' }, { status })
  }
}
