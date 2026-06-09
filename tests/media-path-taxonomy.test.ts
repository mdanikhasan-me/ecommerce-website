import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import sharp from 'sharp'

import { deleteManagedAdminUpload, persistAdminUpload } from '@/backend/admin/admin-utils'
import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import {
  buildCatalogProductAssetPath,
  buildManagedBannerUploadPath,
  buildManagedCategoryUploadPath,
  buildManagedProductUploadPath,
  buildManagedSubcategoryUploadPath,
  sanitizeMediaPathSegment,
} from '@/backend/admin/media-paths'
import { deleteManagedUpload, normalizeProductImages } from '@/backend/admin/product-editor'
import { AdminMediaReferenceSource } from '@/backend/admin/media-reference-guard'

async function makePngDataUrl() {
  const png = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 4,
      background: '#101827',
    },
  })
    .png()
    .toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

async function removeUploadUrl(url: string | null | undefined) {
  if (!url?.startsWith('/uploads/') && !url?.startsWith('/assets/categories/subcategories/')) return
  await fs.rm(path.join(process.cwd(), 'public', url.replace(/^\/+/, '')), { force: true })
  if (url.startsWith('/uploads/')) {
    await pruneEmptyParents(path.dirname(path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))))
  }
}

async function pruneEmptyParents(start: string) {
  const stop = path.resolve(process.cwd(), 'public', 'uploads')
  let current = path.resolve(start)

  while (current.startsWith(stop) && current !== stop) {
    try {
      await fs.rmdir(current)
    } catch {
      return
    }
    current = path.dirname(current)
  }
}

function referenceSource(): AdminMediaReferenceSource {
  return {
    async countReferences(input) {
      return {
        complete: true,
        fields: input.fields.map((field) => ({
          fieldKey: field.key,
          count: 0,
        })),
      }
    },
  }
}

describe('media path taxonomy', () => {
  it('sanitizes unsafe folder segments before planning local media paths', () => {
    assert.equal(sanitizeMediaPathSegment('Mobile Phones'), 'mobile-phones')
    assert.equal(sanitizeMediaPathSegment('../secret'), 'general')
    assert.equal(sanitizeMediaPathSegment(''), 'general')
    assert.equal(sanitizeMediaPathSegment('Name/With/Slash'), 'general')
    assert.equal(sanitizeMediaPathSegment('Control\u0000Name'), 'general')
  })

  it('builds organized source catalog and managed upload paths', () => {
    assert.equal(
      buildCatalogProductAssetPath({
        categorySlug: 'Electronics',
        subcategorySlug: 'Mobile Phones',
        productSlug: 'Example Product',
        extension: 'JPG',
      }),
      '/assets/products/catalog/electronics/mobile-phones/example-product/main.jpg',
    )

    assert.deepEqual(
      buildManagedProductUploadPath({
        categorySlug: 'electronics',
        subcategorySlug: 'mobile-phones',
        productSlugOrId: 'example-product',
        mediaId: 'image-1',
        extension: 'png',
      }),
      {
        directorySegments: ['uploads', 'products', 'electronics', 'mobile-phones', 'example-product'],
        publicPathPrefix: '/uploads/products/electronics/mobile-phones/example-product',
        baseName: 'image-1',
        examplePublicPath: '/uploads/products/electronics/mobile-phones/example-product/image-1.png',
      },
    )

    assert.equal(
      buildManagedBannerUploadPath({ bannerSlugOrId: 'Launch Hero', mediaId: 'desktop' }).examplePublicPath,
      '/uploads/admin/banners/launch-hero/desktop.webp',
    )
    assert.equal(
      buildManagedCategoryUploadPath({ categorySlug: 'Beauty & Health', mediaId: 'image' }).examplePublicPath,
      '/uploads/categories/beauty-health.webp',
    )
    assert.deepEqual(
      buildManagedSubcategoryUploadPath({ subcategorySlug: 'Mobile Phones' }),
      {
        directorySegments: ['assets', 'categories', 'subcategories'],
        publicPathPrefix: '/assets/categories/subcategories',
        baseName: 'mobile-phones',
        examplePublicPath: '/assets/categories/subcategories/mobile-phones.webp',
      },
    )
  })

  it('persists product and banner uploads under nested roots while parent categories use a stable slug file', async () => {
    const dataUrl = await makePngDataUrl()
    const createdUrls: string[] = []

    try {
      const [productImage] = await normalizeProductImages(
        [{ url: dataUrl, alt: 'Taxonomy product' }],
        'taxonomy-product',
        { categorySlug: 'electronics', subcategorySlug: 'mobile-phones' },
      )
      createdUrls.push(productImage.url)
      assert.match(
        productImage.url,
        /^\/uploads\/products\/electronics\/mobile-phones\/taxonomy-product\/image-1-.+\.webp$/,
      )

      const bannerUrl = await persistAdminUpload(dataUrl, {
        purpose: 'banners',
        ownerSlugOrId: 'Home Hero',
        mediaId: 'desktop',
      })
      createdUrls.push(bannerUrl ?? '')
      assert.match(bannerUrl ?? '', /^\/uploads\/admin\/banners\/home-hero\/desktop-.+\.webp$/)

      const mobileBannerUrl = await persistAdminUpload(dataUrl, {
        purpose: 'banners',
        ownerSlugOrId: 'Home Hero',
        mediaId: 'mobile',
      })
      createdUrls.push(mobileBannerUrl ?? '')
      assert.match(mobileBannerUrl ?? '', /^\/uploads\/admin\/banners\/home-hero\/mobile-.+\.webp$/)

      const categoryUrl = await persistAdminUpload(dataUrl, {
        purpose: 'categories',
        ownerSlugOrId: 'mobile-phones',
        mediaId: 'image',
      })
      createdUrls.push(categoryUrl ?? '')
      assert.equal(categoryUrl, '/uploads/categories/mobile-phones.webp')

      const subcategoryUrl = await persistAdminUpload(dataUrl, {
        purpose: 'categories',
        ownerSlugOrId: 'mobile-phones',
        mediaId: 'image',
        categoryKind: 'subcategory',
      })
      createdUrls.push(subcategoryUrl ?? '')
      assert.equal(subcategoryUrl, '/assets/categories/subcategories/mobile-phones.webp')
    } finally {
      await Promise.all(createdUrls.map(removeUploadUrl))
    }
  })

  it('keeps old and nested upload paths cleanup-compatible while protecting source assets', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boilabin-nested-upload-cleanup-'))

    try {
      const publicRoot = path.join(root, 'public')
      const oldUrl = '/uploads/products/old-product.webp'
      const nestedUrl = '/uploads/products/electronics/mobile-phones/product-1/image.webp'
      const sourceUrl = '/assets/products/catalog/electronics/mobile-phones/product-1/main.webp'
      const categoryUrl = '/uploads/categories/electronics.webp'
      const subcategoryUrl = '/assets/categories/subcategories/mobile-phones.webp'

      for (const url of [oldUrl, nestedUrl, sourceUrl, categoryUrl, subcategoryUrl]) {
        const target = path.join(publicRoot, url.replace(/^\/+/, ''))
        await fs.mkdir(path.dirname(target), { recursive: true })
        await fs.writeFile(target, 'fixture')
      }

      assert.equal(classifyAdminMediaPath(oldUrl).canDeleteLocalFile, true)
      assert.equal(classifyAdminMediaPath(nestedUrl).canDeleteLocalFile, true)
      assert.equal(classifyAdminMediaPath(categoryUrl).canDeleteLocalFile, true)
      assert.equal(classifyAdminMediaPath(sourceUrl).canDeleteLocalFile, false)
      assert.equal(classifyAdminMediaPath(subcategoryUrl).canDeleteLocalFile, true)
      assert.equal(classifyAdminMediaPath('/assets/categories/electronics.jpg').canDeleteLocalFile, false)
      assert.equal(classifyAdminMediaPath('/assets/categories/subcategories/../secret.webp').canDeleteLocalFile, false)
      assert.equal(classifyAdminMediaPath('/uploads/products/electronics/product.webp?token=1').canDeleteLocalFile, false)

      assert.equal(await deleteManagedUpload(oldUrl, { referenceSource: referenceSource(), publicRoot }), true)
      assert.equal(await deleteManagedUpload(nestedUrl, { referenceSource: referenceSource(), publicRoot }), true)
      assert.equal(await deleteManagedAdminUpload(categoryUrl, { referenceSource: referenceSource(), publicRoot }), true)
      assert.equal(await deleteManagedUpload(sourceUrl, { referenceSource: referenceSource(), publicRoot }), false)
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
