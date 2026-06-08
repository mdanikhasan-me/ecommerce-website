import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildInvoiceDownloadFilename,
  buildOrderInvoiceContext,
  formatOrderInvoiceEnumLabel,
  generateOrderInvoicePdf,
  getInvoicePdfDownloadPath,
} from '@/backend/orders/order-invoice'

function makeInvoiceContext() {
  return buildOrderInvoiceContext({
    sessionUserName: 'Anik Hasan',
    sessionUserEmail: 'anikhasan2@icloud.com',
    order: {
      id: 'order_390',
      orderNumber: 'BLB-260608-6771',
      userId: 'user_390',
      addressId: 'address_390',
      subtotal: 169000,
      shippingFee: 0,
      discount: 0,
      tax: 0,
      total: 169000,
      currency: 'BDT',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH_ON_DELIVERY',
      couponId: null,
      notes: null,
      trackingNumber: null,
      estimatedDelivery: null,
      deliveredAt: null,
      cancelledAt: null,
      cancelReason: null,
      isGuestOrder: false,
      guestEmail: null,
      guestPhone: null,
      createdAt: new Date('2026-06-08T10:00:00.000Z'),
      updatedAt: new Date('2026-06-08T10:00:00.000Z'),
      coupon: null,
      address: {
        id: 'address_390',
        userId: 'user_390',
        fullName: 'Anik Hasan',
        phone: '01758409063',
        addressLine1: 'Bashundhara R/A',
        addressLine2: 'J Block, Road 20',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1229',
        country: 'Bangladesh',
        isDefault: true,
        createdAt: new Date('2026-06-08T10:00:00.000Z'),
        updatedAt: new Date('2026-06-08T10:00:00.000Z'),
      },
      items: [
        {
          id: 'item_390',
          orderId: 'order_390',
          productId: 'product_390',
          variantId: null,
          productName: 'Samsung Galaxy S24 Ultra 256GB',
          productSku: 'S24-ULTRA-256',
          variantName: null,
          price: 169000,
          quantity: 1,
          total: 169000,
          imageUrl: null,
        },
      ],
    } as any,
  }) as any
}

describe('buyer order invoice PDF generation', () => {
  it('builds clean download filenames and stable API paths', () => {
    assert.equal(
      buildInvoiceDownloadFilename(' BLB-260608-6771 '),
      'boilabin-invoice-BLB-260608-6771.pdf',
    )
    assert.equal(
      buildInvoiceDownloadFilename('BLB/260608 6771'),
      'boilabin-invoice-BLB-260608-6771.pdf',
    )
    assert.equal(getInvoicePdfDownloadPath('order 390'), '/api/account/orders/order%20390/invoice')
  })

  it('formats enum labels without inventing payment or tax claims', () => {
    assert.equal(formatOrderInvoiceEnumLabel('CASH_ON_DELIVERY'), 'Cash on Delivery')
    assert.equal(formatOrderInvoiceEnumLabel('PARTIALLY_REFUNDED'), 'Partially Refunded')
  })

  it('returns a real non-empty PDF containing actual order details', () => {
    const context = makeInvoiceContext()
    const pdf = generateOrderInvoicePdf(context)
    const source = pdf.toString('utf8')

    assert.ok(pdf.length > 1000)
    assert.equal(source.startsWith('%PDF-1.4'), true)
    assert.match(source, /\/Type \/Catalog/)
    assert.match(source, /Boilabin/)
    assert.match(source, /Order Invoice/)
    assert.match(source, /Invoice \/ Order:/)
    assert.match(source, /Payment status:/)
    assert.match(source, /Customer:/)
    assert.match(source, /Delivery address:/)
    assert.match(source, /Item/)
    assert.match(source, /SKU/)
    assert.match(source, /Qty/)
    assert.match(source, /Unit/)
    assert.match(source, /Line total/)
    assert.match(source, /BLB-260608-6771/)
    assert.match(source, /Tk 169,000/)
    assert.match(source, /Samsung Galaxy S24 Ultra 256GB/)
    assert.match(source, /Cash on Delivery/)
    assert.match(source, /Grand total/)
    assert.match(source, /Support/)
    assert.match(source, /hello@boilabin\.com/)
    assert.match(source, /01758409063/)
    assert.doesNotMatch(source, /VAT|Tax invoice|Transaction ID|Tracking number/i)
  })
})
