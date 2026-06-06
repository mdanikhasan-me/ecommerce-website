import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import sharp from 'sharp'

import {
  persistAdminBannerImageFile,
  type AdminBannerUploadFile,
} from '@/backend/admin/banner-image-upload'
import { BANNER_IMAGE_DATA_URL_ERROR } from '@/backend/admin/banner-image-policy'
import { parseAdminBannerPayload } from '@/backend/admin/banner-editor'
import { classifyAdminMediaPath } from '@/backend/admin/media-lifecycle'
import { buildManagedBannerUploadPath } from '@/backend/admin/media-paths'

async function makePngBuffer() {
  return sharp({
    create: {
      width: 24,
      height: 12,
      channels: 4,
      background: '#111111',
    },
  })
    .png()
    .toBuffer()
}

function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength)
  new Uint8Array(arrayBuffer).set(buffer)
  return arrayBuffer
}

function makeUploadFile(buffer: Buffer): AdminBannerUploadFile {
  return {
    size: buffer.byteLength,
    type: 'image/png',
    arrayBuffer: async () => toArrayBuffer(buffer),
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function removeStep314UploadDirectory() {
  const root = path.resolve(process.cwd(), 'public', 'uploads', 'admin', 'banners')
  const target = path.resolve(root, 'step-314-banner-upload')
  assert.ok(target.startsWith(`${root}${path.sep}`))
  await fs.rm(target, { recursive: true, force: true })
}

describe('admin banner upload base64 fix', () => {
  it('persists desktop and mobile banner files as short managed URLs', async () => {
    const png = await makePngBuffer()
    const createdUrls: string[] = []

    try {
      const desktopUrl = await persistAdminBannerImageFile(makeUploadFile(png), {
        ownerSlugOrId: 'Step 314 Banner Upload',
        slot: 'desktop',
      })
      createdUrls.push(desktopUrl)

      const mobileUrl = await persistAdminBannerImageFile(makeUploadFile(png), {
        ownerSlugOrId: 'Step 314 Banner Upload',
        slot: 'mobile',
      })
      createdUrls.push(mobileUrl)

      assert.match(
        desktopUrl,
        /^\/uploads\/admin\/banners\/step-314-banner-upload\/desktop-.+\.webp$/,
      )
      assert.match(
        mobileUrl,
        /^\/uploads\/admin\/banners\/step-314-banner-upload\/mobile-.+\.webp$/,
      )

      for (const url of createdUrls) {
        assert.doesNotMatch(url, /^data:image\//)
        assert.equal(classifyAdminMediaPath(url).canDeleteLocalFile, true)
        assert.equal(
          await fileExists(path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))),
          true,
        )
      }
    } finally {
      await removeStep314UploadDirectory()
    }
  })

  it('rejects inline banner data URLs before JSON save payloads hit persistence', () => {
    for (const fieldName of ['imageUrl', 'mobileImageUrl'] as const) {
      const parsed = parseAdminBannerPayload({
        title: 'Offer',
        [fieldName]: 'data:image/png;base64,AAAA',
      })

      assert.equal(parsed.success, false)
      assert.equal(parsed.error, BANNER_IMAGE_DATA_URL_ERROR)
    }
  })

  it('keeps source banner assets protected while managed banner uploads stay cleanup eligible', () => {
    const sourceBanner = classifyAdminMediaPath('/assets/banners/home-hero-galaxy-s24-ultra.jpg')
    const managedBanner = classifyAdminMediaPath(
      '/uploads/admin/banners/step-314-banner-upload/desktop-test.webp',
    )

    assert.equal(sourceBanner.canDeleteLocalFile, false)
    assert.equal(managedBanner.canDeleteLocalFile, true)
  })

  it('keeps traversal-like banner owner values inside the approved managed root', () => {
    const plan = buildManagedBannerUploadPath({
      bannerSlugOrId: '../secret',
      mediaId: '../desktop',
    })

    assert.equal(plan.publicPathPrefix, '/uploads/admin/banners/banner')
    assert.equal(plan.examplePublicPath, '/uploads/admin/banners/banner/media.webp')
    assert.deepEqual(plan.directorySegments, ['uploads', 'admin', 'banners', 'banner'])
    assert.doesNotMatch(plan.examplePublicPath, /\.\.|\\/)
  })

  it('continues to allow source banner paths and storefront rendering of managed upload paths', async () => {
    for (const imageUrl of [
      '/assets/banners/home-hero-galaxy-s24-ultra.jpg',
      '/uploads/admin/banners/home-hero/desktop-test.webp',
    ]) {
      const parsed = parseAdminBannerPayload({ imageUrl })

      assert.equal(parsed.success, true)
      if (parsed.success) {
        assert.equal(parsed.data.imageUrl, imageUrl)
      }
    }

    const heroSource = await fs.readFile(
      path.join(process.cwd(), 'src/frontend/components/home/HeroBanner.tsx'),
      'utf8',
    )

    assert.match(heroSource, /const desktopImageUrl = banner\.imageUrl\?\.trim\(\) \?\? ''/)
    assert.match(heroSource, /const mobileHeroImage = mobileImageUrl \|\| desktopImageUrl/)
    assert.match(heroSource, /src=\{desktopImageUrl\}/)
    assert.match(heroSource, /src=\{mobileHeroImage\}/)
  })

  it('wires the banner form to managed upload instead of storing file reader data URLs', async () => {
    const [formSource, imageFieldSource, routeSource] = await Promise.all([
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/BannerEditorForm.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/frontend/components/admin/AdminImageField.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'src/app/api/admin/banners/upload/route.ts'), 'utf8'),
    ])

    assert.match(formSource, /fetch\('\/api\/admin\/banners\/upload'/)
    assert.match(formSource, /uploadBannerImage\('desktop', file\)/)
    assert.match(formSource, /uploadBannerImage\('mobile', file\)/)
    assert.match(formSource, /rejectDataUrls/)
    assert.match(
      imageFieldSource,
      /uploadImage \? await uploadImage\(file\) : await readFileAsDataUrl\(file\)/,
    )
    assert.match(routeSource, /await req\.formData\(\)/)
    assert.match(routeSource, /persistAdminBannerImageFile/)
    assert.doesNotMatch(routeSource, /\/assets\/banners|public[\\/]assets[\\/]banners/)
  })
})
