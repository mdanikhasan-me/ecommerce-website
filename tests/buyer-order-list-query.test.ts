import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_ORDER_LIST_PAGE,
  MAX_ORDER_LIST_PAGE,
  parseOrderListPage,
} from '@/backend/orders/buyer-order-list'

describe('buyer order list query parsing', () => {
  it('accepts whole positive page numbers for order history queries', () => {
    assert.equal(parseOrderListPage('1'), 1)
    assert.equal(parseOrderListPage(' 12 '), 12)
    assert.equal(parseOrderListPage(String(MAX_ORDER_LIST_PAGE)), MAX_ORDER_LIST_PAGE)
  })

  it('defaults malformed, partial, non-positive, and unsafe page values', () => {
    for (const value of [null, undefined, '', '0', '-1', '1.5', '2abc', '0x10', '1e3', 'Infinity', 'NaN']) {
      assert.equal(parseOrderListPage(value), DEFAULT_ORDER_LIST_PAGE)
    }
  })

  it('caps very large order history pages before skip calculation', () => {
    assert.equal(parseOrderListPage(String(MAX_ORDER_LIST_PAGE + 1)), MAX_ORDER_LIST_PAGE)
    assert.equal(parseOrderListPage('999999999999999999999'), DEFAULT_ORDER_LIST_PAGE)
  })
})
