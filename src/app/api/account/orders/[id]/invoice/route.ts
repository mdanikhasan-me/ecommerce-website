import { NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { buildInvoiceDownloadFilename, generateOrderInvoicePdf, getOwnedOrderInvoiceContext } from '@/backend/orders/order-invoice'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const userId = session.user.id
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const { id } = await params
  const context = await getOwnedOrderInvoiceContext({
    orderId: id,
    userId,
    sessionUserName: session.user.name,
    sessionUserEmail: session.user.email,
  })

  if (!context) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const pdf = generateOrderInvoicePdf(context)
  const filename = buildInvoiceDownloadFilename(context.order.orderNumber)

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
