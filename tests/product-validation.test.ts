import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeTags, parseAdminProductPayload } from '@/backend/admin/product-editor'

const validProduct = {
  name: '  Cotton Shirt  ',
  slug: ' cotton-shirt ',
  description: '  Comfortable everyday shirt.  ',
  shortDescription: '  Soft cotton  ',
  sku: ' SHIRT-001 ',
  basePrice: '1200',
  salePrice: '999',
  costPrice: '',
  stockQuantity: '20',
  lowStockThreshold: '5',
  weight: '',
  categoryId: 'cat_1',
  tags: [' Shirt ', 'MEN'],
  images: [{ url: '/uploads/products/shirt.webp', alt: ' Shirt photo ' }],
  variants: [
    {
      name: 'Large',
      sku: 'SHIRT-001-L',
      optionName: 'Size',
      optionValue: 'L',
      price: '1250',
      salePrice: '1100',
      stockQuantity: '8',
    },
  ],
}

describe('admin product validation', () => {
  it('normalizes product payloads', () => {
    const parsed = parseAdminProductPayload(validProduct)

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.name, 'Cotton Shirt')
      assert.equal(parsed.data.slug, 'cotton-shirt')
      assert.equal(parsed.data.description, 'Comfortable everyday shirt.')
      assert.equal(parsed.data.basePrice, 1200)
      assert.equal(parsed.data.salePrice, 999)
      assert.equal(parsed.data.costPrice, null)
      assert.equal(parsed.data.weight, null)
      assert.equal(parsed.data.images[0].alt, 'Shirt photo')
      assert.equal(parsed.data.variants[0].stockQuantity, 8)
    }
  })

  it('rejects sale prices above base prices', () => {
    const parsed = parseAdminProductPayload({ ...validProduct, salePrice: 1300 })

    assert.equal(parsed.success, false)
  })

  it('rejects duplicate variant SKUs', () => {
    const parsed = parseAdminProductPayload({
      ...validProduct,
      variants: [
        { name: 'Large', sku: 'SHIRT-001-L', stockQuantity: 1 },
        { name: 'Large Backup', sku: 'shirt-001-l', stockQuantity: 1 },
      ],
    })

    assert.equal(parsed.success, false)
  })

  it('rejects unsafe image URLs and partial variant options', () => {
    const unsafeImage = parseAdminProductPayload({
      ...validProduct,
      images: [{ url: 'javascript:alert(1)' }],
    })
    const partialOption = parseAdminProductPayload({
      ...validProduct,
      variants: [{ name: 'Large', sku: 'SHIRT-001-L', optionName: 'Size' }],
    })

    assert.equal(unsafeImage.success, false)
    assert.equal(partialOption.success, false)
  })

  it('normalizes tags to lowercase unique-ish values', () => {
    assert.deepEqual(normalizeTags([' Shirt ', 'MEN', '']), ['shirt', 'men'])
  })
})
