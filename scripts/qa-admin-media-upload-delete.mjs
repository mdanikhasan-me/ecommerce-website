import { spawnSync } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'

import {
  evaluateDatabaseSafety,
  loadEnv,
} from './check-db-url-safety.mjs'

const QA_PREFIX = '__qa_media_step285'
const UPLOAD_ROOTS = {
  product: '/uploads/products/',
  banner: '/uploads/admin/banners/',
  category: '/uploads/admin/categories/',
}

function createBaseEvidence() {
  return {
    step: 285,
    safeAggregateOnly: true,
    privateEnvPrinted: false,
    fullPathsPrinted: false,
    fullUploadFilenamesPrinted: false,
    browserPathRan: false,
    browserPathReason: 'No approved non-secret authenticated admin browser session was used in this helper-level proof.',
    apiHelperPathRan: false,
    preflight: {
      dbUrlSafetyPassed: false,
      databaseUrl: 'not-checked',
      shadowDatabaseUrl: 'not-checked',
      shadowDatabaseSeparate: false,
      localDbReachable: false,
    },
    adminFixtureReadiness: {
      browserAdminSessionAvailable: false,
      localPasswordMutationRun: false,
      reason: 'Helper/API-level proof does not need admin credentials and does not print or mutate them.',
    },
    uploadRootsTested: {
      product: UPLOAD_ROOTS.product,
      banner: UPLOAD_ROOTS.banner,
      category: UPLOAD_ROOTS.category,
    },
    tempRecordTypesTested: [],
    product: createFlowSummary(),
    banner: createFlowSummary(),
    category: createFlowSummary(),
    preservation: {
      productActiveReferencePreserved: false,
      productVariantReferencePreserved: false,
      historicalEvidenceSimulatedPreserved: false,
      referenceLookupFailurePreserved: false,
      incompleteReferenceCheckPreserved: false,
      adminSharedReferencePreserved: false,
      protectedSourceAssetPreserved: false,
    },
    cleanup: {
      tempRecordsCreated: 0,
      tempRecordsCleaned: false,
      tempFilesCreated: 0,
      tempFilesCleaned: false,
      realMediaFilesDeleted: false,
      deletionPerformedOnlyForTempFiles: true,
      cleanupErrors: 0,
    },
    stopped: false,
    stopReason: null,
  }
}

function createFlowSummary() {
  return {
    created: false,
    uploadedToExpectedRoot: false,
    uploadedToNestedTaxonomyRoot: false,
    physicalFileAppeared: false,
    activeReferencePreserved: false,
    replaced: false,
    replacementDeletedOldFile: false,
    replacementKeptNewFile: false,
    deletedRecord: false,
    deleteRemovedCurrentFile: false,
  }
}

export function sanitizeAdminMediaQaEvidence(evidence) {
  return JSON.parse(JSON.stringify(evidence, (_key, value) => {
    if (typeof value !== 'string') return value

    return value
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[redacted-db-url]')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b(password|secret|token|authorization|cookie)\s*[:=]\s*[^\s,"']+/gi, '$1=[redacted]')
      .replace(/[A-Za-z]:[\\/][^"'\n\r]+/g, '[redacted-local-path]')
  }))
}

function unwrapImportedModule(module) {
  return module?.default ?? module?.['module.exports'] ?? module
}

async function loadAppMediaHelpers(env) {
  process.env.DATABASE_URL = env.DATABASE_URL
  process.env.SHADOW_DATABASE_URL = env.SHADOW_DATABASE_URL

  const [
    adminUtilsModule,
    productEditorModule,
    adapterModule,
    guardModule,
  ] = await Promise.all([
    import('../src/backend/admin/admin-utils.ts'),
    import('../src/backend/admin/product-editor.ts'),
    import('../src/backend/admin/media-reference-adapter.ts'),
    import('../src/backend/admin/media-reference-guard.ts'),
  ])

  return {
    adminUtils: unwrapImportedModule(adminUtilsModule),
    productEditor: unwrapImportedModule(productEditorModule),
    adapter: unwrapImportedModule(adapterModule),
    guard: unwrapImportedModule(guardModule),
  }
}

function isExpectedRoot(url, root) {
  return typeof url === 'string' && url.startsWith(root)
}

function sanitizeExpectedMediaPathSegment(value, fallback = 'general') {
  const raw = String(value ?? '').trim().toLowerCase()

  if (!raw || /[\0-\x1f\x7f]/.test(raw) || raw.includes('..') || /[\\/]/.test(raw)) {
    return fallback
  }

  const sanitized = raw
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return sanitized || fallback
}

function publicFilePathForUrl(url, publicRoot = path.resolve(process.cwd(), 'public')) {
  if (!url?.startsWith('/uploads/')) return null
  if (/[\0?#]/.test(url)) return null
  return path.resolve(publicRoot, url.replace(/^\/+/, ''))
}

async function fileExistsForUrl(url) {
  const filePath = publicFilePathForUrl(url)
  if (!filePath) return false

  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function createDataImage(color) {
  const buffer = await sharp({
    create: {
      width: 12,
      height: 12,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toBuffer()

  return `data:image/png;base64,${buffer.toString('base64')}`
}

function createSyntheticReferenceSource(counts = {}, options = {}) {
  return {
    async countReferences(input) {
      if (options.throwError) throw new Error('synthetic reference lookup failed')

      return {
        complete: options.complete !== false,
        fields: input.fields.map((field) => ({
          fieldKey: field.key,
          count: counts[field.key] ?? 0,
        })),
        errors: options.complete === false ? ['synthetic incomplete reference check'] : undefined,
      }
    },
  }
}

function tempName(runId, type) {
  return `${QA_PREFIX}_${type}_${runId}`
}

async function safeDeleteTempRows(prisma, runId, evidence) {
  const slugPrefix = `${QA_PREFIX}-`
  const namePrefix = `${QA_PREFIX}_`
  const skuPrefix = `${QA_PREFIX.toUpperCase()}-`
  const cleanupSteps = [
    () => prisma.product.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: slugPrefix } },
          { sku: { startsWith: skuPrefix } },
          { name: { startsWith: namePrefix } },
        ],
      },
    }),
    () => prisma.banner.deleteMany({
      where: {
        OR: [
          { title: { startsWith: namePrefix } },
          { position: `${QA_PREFIX}_position_${runId}` },
        ],
      },
    }),
    () => prisma.category.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: slugPrefix } },
          { name: { startsWith: namePrefix } },
        ],
      },
    }),
  ]

  for (const step of cleanupSteps) {
    try {
      await step()
    } catch {
      evidence.cleanup.cleanupErrors += 1
    }
  }
}

async function cleanupTrackedUploads({
  urls,
  adminUtils,
  productEditor,
  referenceSource,
  evidence,
}) {
  for (const url of urls) {
    try {
      if (isExpectedRoot(url, UPLOAD_ROOTS.product)) {
        await productEditor.deleteManagedUpload(url, { referenceSource })
      } else if (typeof url === 'string' && url.startsWith('/uploads/admin/')) {
        await adminUtils.deleteManagedAdminUpload(url, { referenceSource })
      }
    } catch {
      evidence.cleanup.cleanupErrors += 1
    }
  }
}

async function runProductFlow({
  prisma,
  runId,
  helpers,
  referenceSource,
  imageA,
  imageB,
  categoryId,
  createdUrls,
  evidence,
}) {
  const name = tempName(runId, 'product')
  const slug = `${QA_PREFIX}-product-${runId}`
  const sku = `${QA_PREFIX.toUpperCase()}-${runId}`

  const [firstImage] = await helpers.productEditor.normalizeProductImages(
    [{ url: imageA, alt: 'QA product image' }],
    slug,
    { categorySlug: 'qa-category', subcategorySlug: 'qa-subcategory' },
  )
  createdUrls.add(firstImage.url)

  const seller = await prisma.seller.findFirst({
    where: { isFirstParty: true, status: 'APPROVED' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!seller) throw new Error('first-party seller fixture unavailable')

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku,
      description: 'Temporary Step 285 media QA product.',
      categoryId,
      sellerId: seller.id,
      basePrice: 1,
      stockQuantity: 1,
      isActive: false,
      isNew: false,
      images: { create: [firstImage] },
    },
    include: { images: true },
  })

  evidence.cleanup.tempRecordsCreated += 1
  evidence.tempRecordTypesTested.push('product')
  evidence.product.created = true
  evidence.product.uploadedToExpectedRoot = isExpectedRoot(firstImage.url, UPLOAD_ROOTS.product)
  evidence.product.uploadedToNestedTaxonomyRoot = isExpectedRoot(
    firstImage.url,
    `${UPLOAD_ROOTS.product}qa-category/qa-subcategory/${sanitizeExpectedMediaPathSegment(slug, 'product')}/`,
  )
  evidence.product.physicalFileAppeared = await fileExistsForUrl(firstImage.url)

  const activeDelete = await helpers.productEditor.deleteManagedUpload(firstImage.url, { referenceSource })
  evidence.product.activeReferencePreserved = activeDelete === false && await fileExistsForUrl(firstImage.url)
  evidence.preservation.productActiveReferencePreserved = evidence.product.activeReferencePreserved

  const [secondImage] = await helpers.productEditor.normalizeProductImages(
    [{ url: imageB, alt: 'QA product replacement image' }],
    slug,
    { categorySlug: 'qa-category', subcategorySlug: 'qa-subcategory' },
  )
  createdUrls.add(secondImage.url)

  await prisma.productImage.deleteMany({ where: { productId: product.id } })
  await prisma.productImage.create({
    data: {
      productId: product.id,
      ...secondImage,
    },
  })

  const replacementResults = await helpers.productEditor.deleteRemovedProductImages(
    [firstImage.url],
    [secondImage.url],
    { referenceSource },
  )
  evidence.product.replaced = true
  evidence.product.replacementDeletedOldFile = replacementResults[0] === true && !(await fileExistsForUrl(firstImage.url))
  evidence.product.replacementKeptNewFile = await fileExistsForUrl(secondImage.url)

  await prisma.product.delete({ where: { id: product.id } })
  const deletedCurrent = await helpers.productEditor.deleteManagedUpload(secondImage.url, { referenceSource })
  evidence.product.deletedRecord = true
  evidence.product.deleteRemovedCurrentFile = deletedCurrent === true && !(await fileExistsForUrl(secondImage.url))
}

async function runProductVariantPreservationFlow({
  prisma,
  runId,
  helpers,
  referenceSource,
  imageA,
  categoryId,
  createdUrls,
  evidence,
}) {
  const name = tempName(runId, 'variant_product')
  const slug = `${QA_PREFIX}-variant-product-${runId}`
  const sku = `${QA_PREFIX.toUpperCase()}-VAR-${runId}`
  const [image] = await helpers.productEditor.normalizeProductImages(
    [{ url: imageA, alt: 'QA variant image' }],
    slug,
    { categorySlug: 'qa-category', subcategorySlug: 'qa-subcategory' },
  )
  createdUrls.add(image.url)

  const seller = await prisma.seller.findFirst({
    where: { isFirstParty: true, status: 'APPROVED' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!seller) throw new Error('first-party seller fixture unavailable')

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku,
      description: 'Temporary Step 285 variant media QA product.',
      categoryId,
      sellerId: seller.id,
      basePrice: 1,
      stockQuantity: 1,
      isActive: false,
      isNew: false,
      images: { create: [image] },
      variants: {
        create: [{
          name: 'Variant media guard',
          sku: `${sku}-1`,
          stockQuantity: 1,
          image: image.url,
        }],
      },
    },
  })

  evidence.cleanup.tempRecordsCreated += 1
  await prisma.productImage.deleteMany({ where: { productId: product.id } })

  const deleted = await helpers.productEditor.deleteManagedUpload(image.url, { referenceSource })
  evidence.preservation.productVariantReferencePreserved = deleted === false && await fileExistsForUrl(image.url)

  await prisma.product.delete({ where: { id: product.id } })
  await helpers.productEditor.deleteManagedUpload(image.url, { referenceSource })
}

async function runBannerFlow({
  prisma,
  runId,
  helpers,
  referenceSource,
  imageA,
  imageB,
  createdUrls,
  evidence,
}) {
  const bannerOwner = tempName(runId, 'banner')
  const firstUrl = await helpers.adminUtils.persistAdminUpload(imageA, {
    purpose: 'banners',
    ownerSlugOrId: bannerOwner,
    mediaId: 'desktop',
  })
  createdUrls.add(firstUrl)

  const banner = await prisma.banner.create({
    data: {
      title: bannerOwner,
      imageUrl: firstUrl,
      position: `${QA_PREFIX}_position_${runId}`,
      isActive: false,
    },
  })

  evidence.cleanup.tempRecordsCreated += 1
  evidence.tempRecordTypesTested.push('banner')
  evidence.banner.created = true
  evidence.banner.uploadedToExpectedRoot = isExpectedRoot(firstUrl, UPLOAD_ROOTS.banner)
  evidence.banner.uploadedToNestedTaxonomyRoot = isExpectedRoot(
    firstUrl,
    `${UPLOAD_ROOTS.banner}${sanitizeExpectedMediaPathSegment(bannerOwner, 'banner')}/`,
  )
  evidence.banner.physicalFileAppeared = await fileExistsForUrl(firstUrl)

  const activeDelete = await helpers.adminUtils.deleteManagedAdminUpload(firstUrl, { referenceSource })
  evidence.banner.activeReferencePreserved = activeDelete === false && await fileExistsForUrl(firstUrl)

  const secondUrl = await helpers.adminUtils.persistAdminUpload(imageB, {
    purpose: 'banners',
    ownerSlugOrId: bannerOwner,
    mediaId: 'desktop',
  })
  createdUrls.add(secondUrl)
  await prisma.banner.update({
    where: { id: banner.id },
    data: { imageUrl: secondUrl, mobileImageUrl: null },
  })

  const replacementResults = await helpers.adminUtils.deleteReplacedAdminUploads(
    [firstUrl],
    [secondUrl],
    { referenceSource },
  )
  evidence.banner.replaced = true
  evidence.banner.replacementDeletedOldFile = replacementResults[0] === true && !(await fileExistsForUrl(firstUrl))
  evidence.banner.replacementKeptNewFile = await fileExistsForUrl(secondUrl)

  await prisma.banner.delete({ where: { id: banner.id } })
  const deletedCurrent = await helpers.adminUtils.deleteManagedAdminUpload(secondUrl, { referenceSource })
  evidence.banner.deletedRecord = true
  evidence.banner.deleteRemovedCurrentFile = deletedCurrent === true && !(await fileExistsForUrl(secondUrl))
}

async function runAdminSharedPreservationFlow({
  prisma,
  runId,
  helpers,
  referenceSource,
  imageA,
  createdUrls,
  evidence,
}) {
  const sharedOwner = tempName(runId, 'shared_banner')
  const sharedUrl = await helpers.adminUtils.persistAdminUpload(imageA, {
    purpose: 'banners',
    ownerSlugOrId: sharedOwner,
    mediaId: 'desktop',
  })
  createdUrls.add(sharedUrl)

  const [first, second] = await Promise.all([
    prisma.banner.create({
      data: {
        title: tempName(runId, 'shared_banner_a'),
        imageUrl: sharedUrl,
        position: `${QA_PREFIX}_shared_a_${runId}`,
        isActive: false,
      },
    }),
    prisma.banner.create({
      data: {
        title: tempName(runId, 'shared_banner_b'),
        imageUrl: sharedUrl,
        position: `${QA_PREFIX}_shared_b_${runId}`,
        isActive: false,
      },
    }),
  ])

  evidence.cleanup.tempRecordsCreated += 2
  await prisma.banner.update({ where: { id: first.id }, data: { imageUrl: '/assets/banners/home-hero-iphone-15-pro.jpg' } })
  const deleted = await helpers.adminUtils.deleteManagedAdminUpload(sharedUrl, { referenceSource })
  evidence.preservation.adminSharedReferencePreserved = deleted === false && await fileExistsForUrl(sharedUrl)
  await prisma.banner.deleteMany({ where: { id: { in: [first.id, second.id] } } })
  await helpers.adminUtils.deleteManagedAdminUpload(sharedUrl, { referenceSource })
}

async function runCategoryFlow({
  prisma,
  runId,
  helpers,
  referenceSource,
  imageA,
  imageB,
  createdUrls,
  evidence,
}) {
  const categorySlug = `${QA_PREFIX}-category-${runId}`
  const firstUrl = await helpers.adminUtils.persistAdminUpload(imageA, {
    purpose: 'categories',
    ownerSlugOrId: categorySlug,
    mediaId: 'image',
  })
  createdUrls.add(firstUrl)
  const category = await prisma.category.create({
    data: {
      name: tempName(runId, 'category'),
      slug: categorySlug,
      image: firstUrl,
      isActive: false,
    },
  })

  evidence.cleanup.tempRecordsCreated += 1
  evidence.tempRecordTypesTested.push('category')
  evidence.category.created = true
  evidence.category.uploadedToExpectedRoot = isExpectedRoot(firstUrl, UPLOAD_ROOTS.category)
  evidence.category.uploadedToNestedTaxonomyRoot = isExpectedRoot(
    firstUrl,
    `${UPLOAD_ROOTS.category}${sanitizeExpectedMediaPathSegment(categorySlug, 'category')}/`,
  )
  evidence.category.physicalFileAppeared = await fileExistsForUrl(firstUrl)

  const activeDelete = await helpers.adminUtils.deleteManagedAdminUpload(firstUrl, { referenceSource })
  evidence.category.activeReferencePreserved = activeDelete === false && await fileExistsForUrl(firstUrl)

  const secondUrl = await helpers.adminUtils.persistAdminUpload(imageB, {
    purpose: 'categories',
    ownerSlugOrId: categorySlug,
    mediaId: 'image',
  })
  createdUrls.add(secondUrl)
  await prisma.category.update({ where: { id: category.id }, data: { image: secondUrl } })

  const replacementResults = await helpers.adminUtils.deleteReplacedAdminUploads(
    [firstUrl],
    [secondUrl],
    { referenceSource },
  )
  evidence.category.replaced = true
  evidence.category.replacementDeletedOldFile = replacementResults[0] === true && !(await fileExistsForUrl(firstUrl))
  evidence.category.replacementKeptNewFile = await fileExistsForUrl(secondUrl)

  await prisma.category.delete({ where: { id: category.id } })
  const deletedCurrent = await helpers.adminUtils.deleteManagedAdminUpload(secondUrl, { referenceSource })
  evidence.category.deletedRecord = true
  evidence.category.deleteRemovedCurrentFile = deletedCurrent === true && !(await fileExistsForUrl(secondUrl))

  return category.id
}

async function runSyntheticPreservationChecks({ helpers, imageA, createdUrls, evidence }) {
  const adminUrl = await helpers.adminUtils.persistAdminUpload(imageA, {
    purpose: 'banners',
    ownerSlugOrId: `${QA_PREFIX}-synthetic-banner`,
    mediaId: 'desktop',
  })
  const productUrl = (await helpers.productEditor.normalizeProductImages(
    [{ url: imageA, alt: 'QA synthetic product image' }],
    `${QA_PREFIX}-synthetic`,
    { categorySlug: 'qa-category', subcategorySlug: 'qa-subcategory' },
  ))[0].url
  createdUrls.add(adminUrl)
  createdUrls.add(productUrl)

  const historicalDeleted = await helpers.productEditor.deleteManagedUpload(productUrl, {
    referenceSource: createSyntheticReferenceSource({ 'Review.images': 1 }),
  })
  const failureDeleted = await helpers.adminUtils.deleteManagedAdminUpload(adminUrl, {
    referenceSource: createSyntheticReferenceSource({}, { throwError: true }),
  })
  const incompleteDeleted = await helpers.adminUtils.deleteManagedAdminUpload(adminUrl, {
    referenceSource: createSyntheticReferenceSource({}, { complete: false }),
  })
  const protectedAdminDeleted = await helpers.adminUtils.deleteManagedAdminUpload('/assets/categories/electronics.jpg', {
    referenceSource: createSyntheticReferenceSource(),
  })
  const protectedProductDeleted = await helpers.productEditor.deleteManagedUpload('/images/source.webp', {
    referenceSource: createSyntheticReferenceSource(),
  })

  evidence.preservation.historicalEvidenceSimulatedPreserved = historicalDeleted === false && await fileExistsForUrl(productUrl)
  evidence.preservation.referenceLookupFailurePreserved = failureDeleted === false && await fileExistsForUrl(adminUrl)
  evidence.preservation.incompleteReferenceCheckPreserved = incompleteDeleted === false && await fileExistsForUrl(adminUrl)
  evidence.preservation.protectedSourceAssetPreserved = protectedAdminDeleted === false && protectedProductDeleted === false
}

function assertCoreQaPassed(evidence) {
  const flowChecks = [
    evidence.product.created,
    evidence.product.uploadedToExpectedRoot,
    evidence.product.uploadedToNestedTaxonomyRoot,
    evidence.product.physicalFileAppeared,
    evidence.product.activeReferencePreserved,
    evidence.product.replaced,
    evidence.product.replacementDeletedOldFile,
    evidence.product.replacementKeptNewFile,
    evidence.product.deletedRecord,
    evidence.product.deleteRemovedCurrentFile,
    evidence.banner.created,
    evidence.banner.uploadedToExpectedRoot,
    evidence.banner.uploadedToNestedTaxonomyRoot,
    evidence.banner.physicalFileAppeared,
    evidence.banner.activeReferencePreserved,
    evidence.banner.replaced,
    evidence.banner.replacementDeletedOldFile,
    evidence.banner.replacementKeptNewFile,
    evidence.banner.deletedRecord,
    evidence.banner.deleteRemovedCurrentFile,
    evidence.category.created,
    evidence.category.uploadedToExpectedRoot,
    evidence.category.uploadedToNestedTaxonomyRoot,
    evidence.category.physicalFileAppeared,
    evidence.category.activeReferencePreserved,
    evidence.category.replaced,
    evidence.category.replacementDeletedOldFile,
    evidence.category.replacementKeptNewFile,
    evidence.category.deletedRecord,
    evidence.category.deleteRemovedCurrentFile,
    evidence.preservation.productVariantReferencePreserved,
    evidence.preservation.adminSharedReferencePreserved,
    evidence.preservation.historicalEvidenceSimulatedPreserved,
    evidence.preservation.referenceLookupFailurePreserved,
    evidence.preservation.incompleteReferenceCheckPreserved,
    evidence.preservation.protectedSourceAssetPreserved,
    evidence.cleanup.tempRecordsCleaned,
    evidence.cleanup.tempFilesCleaned,
  ]

  return flowChecks.every(Boolean)
}

export async function runAdminMediaUploadDeleteQa({
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const evidence = createBaseEvidence()
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)
  evidence.preflight.databaseUrl = safety.databaseUrl
  evidence.preflight.shadowDatabaseUrl = safety.shadowDatabaseUrl
  evidence.preflight.shadowDatabaseSeparate = safety.shadowDatabaseSeparate
  evidence.preflight.dbUrlSafetyPassed = safety.safeForLocalMigration

  if (!safety.safeForLocalMigration) {
    evidence.stopped = true
    evidence.stopReason = 'Local DB URL safety failed before any mutation.'
    return sanitizeAdminMediaQaEvidence(evidence)
  }

  const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const createdUrls = new Set()
  let helpers = null
  let prisma = null
  let referenceSource = null

  try {
    helpers = await loadAppMediaHelpers(env)
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
      log: [],
    })
    referenceSource = helpers.adapter.createPrismaAdminMediaReferenceSource(prisma)

    await prisma.category.count()
    evidence.preflight.localDbReachable = true

    const [imageA, imageB, imageC] = await Promise.all([
      createDataImage({ r: 220, g: 60, b: 60, alpha: 1 }),
      createDataImage({ r: 40, g: 160, b: 220, alpha: 1 }),
      createDataImage({ r: 70, g: 190, b: 120, alpha: 1 }),
    ])

    const categoryForProduct = await prisma.category.create({
      data: {
        name: tempName(runId, 'product_category'),
        slug: `${QA_PREFIX}-product-category-${runId}`,
        isActive: false,
      },
    })
    evidence.cleanup.tempRecordsCreated += 1

    await runProductFlow({
      prisma,
      runId,
      helpers,
      referenceSource,
      imageA,
      imageB,
      categoryId: categoryForProduct.id,
      createdUrls,
      evidence,
    })
    await runProductVariantPreservationFlow({
      prisma,
      runId,
      helpers,
      referenceSource,
      imageA: imageC,
      categoryId: categoryForProduct.id,
      createdUrls,
      evidence,
    })
    await prisma.category.delete({ where: { id: categoryForProduct.id } })

    await runBannerFlow({
      prisma,
      runId,
      helpers,
      referenceSource,
      imageA,
      imageB,
      createdUrls,
      evidence,
    })
    await runAdminSharedPreservationFlow({
      prisma,
      runId,
      helpers,
      referenceSource,
      imageA: imageC,
      createdUrls,
      evidence,
    })
    await runCategoryFlow({
      prisma,
      runId,
      helpers,
      referenceSource,
      imageA,
      imageB,
      createdUrls,
      evidence,
    })
    await runSyntheticPreservationChecks({
      helpers,
      imageA: imageC,
      createdUrls,
      evidence,
    })

    evidence.apiHelperPathRan = true
  } catch (error) {
    evidence.stopped = true
    evidence.stopReason = error instanceof Error ? error.message.slice(0, 120) : 'QA harness failed.'
  } finally {
    if (prisma && helpers && referenceSource) {
      await safeDeleteTempRows(prisma, runId, evidence)
      await cleanupTrackedUploads({
        urls: [...createdUrls],
        adminUtils: helpers.adminUtils,
        productEditor: helpers.productEditor,
        referenceSource,
        evidence,
      })

      const remainingFiles = await Promise.all([...createdUrls].map((url) => fileExistsForUrl(url)))
      evidence.cleanup.tempFilesCreated = createdUrls.size
      evidence.cleanup.tempFilesCleaned = remainingFiles.every((exists) => !exists)

      const [productCount, bannerCount, categoryCount] = await Promise.all([
        prisma.product.count({
          where: {
            OR: [
              { slug: { startsWith: `${QA_PREFIX}-` } },
              { sku: { startsWith: `${QA_PREFIX.toUpperCase()}-` } },
              { name: { startsWith: `${QA_PREFIX}_` } },
            ],
          },
        }),
        prisma.banner.count({
          where: {
            OR: [
              { title: { startsWith: `${QA_PREFIX}_` } },
              { position: { startsWith: `${QA_PREFIX}_` } },
            ],
          },
        }),
        prisma.category.count({
          where: {
            OR: [
              { slug: { startsWith: `${QA_PREFIX}-` } },
              { name: { startsWith: `${QA_PREFIX}_` } },
            ],
          },
        }),
      ])
      evidence.cleanup.tempRecordsCleaned = productCount === 0 && bannerCount === 0 && categoryCount === 0
    }

    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect()
    }
  }

  if (!evidence.stopped && !assertCoreQaPassed(evidence)) {
    evidence.stopped = true
    evidence.stopReason = 'One or more media lifecycle assertions did not pass.'
  }

  return sanitizeAdminMediaQaEvidence(evidence)
}

export async function runAdminMediaUploadDeleteQaCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
  spawn = spawnSync,
  allowTsxRerun = false,
} = {}) {
  const outIndex = argv.indexOf('--out')
  const outPath = outIndex >= 0 ? argv[outIndex + 1] : null
  const allowedArgs = new Set(['--out', outPath].filter(Boolean))
  const unknownArgs = argv.filter((arg) => !allowedArgs.has(arg))

  if (unknownArgs.length > 0 || (outIndex >= 0 && !outPath)) {
    stderr('Unsupported admin media upload-delete QA option.')
    return 1
  }

  if (allowTsxRerun && !isRunningWithTsx()) {
    return runAdminMediaUploadDeleteQaWithTsx({
      argv,
      cwd,
      stdout,
      stderr,
      spawn,
    })
  }

  const evidence = await runAdminMediaUploadDeleteQa({ cwd })
  const formatted = `${JSON.stringify(evidence, null, 2)}\n`

  if (outPath) {
    const resolvedOutPath = path.resolve(cwd, outPath)
    await fs.mkdir(path.dirname(resolvedOutPath), { recursive: true })
    await fs.writeFile(resolvedOutPath, formatted)
  } else {
    stdout(formatted.trimEnd())
  }

  return evidence.stopped ? 1 : 0
}

function isRunningWithTsx() {
  const signature = [...process.execArgv, process.argv[1] ?? ''].join(' ').toLowerCase()
  return signature.includes('tsx')
}

function relayProcessOutput(value, write) {
  const output = String(value ?? '').trimEnd()
  if (output) write(output)
}

export function runAdminMediaUploadDeleteQaWithTsx({
  argv,
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
  spawn = spawnSync,
} = {}) {
  const tsxCli = path.resolve(cwd, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  if (!existsSync(tsxCli)) {
    stderr('Admin media upload-delete QA requires the project-local TypeScript runner.')
    return 1
  }

  const scriptPath = path.resolve(cwd, 'scripts', 'qa-admin-media-upload-delete.mjs')
  const result = spawn(process.execPath, [tsxCli, scriptPath, ...argv], {
    cwd,
    encoding: 'utf8',
  })

  relayProcessOutput(result.stdout, stdout)
  relayProcessOutput(result.stderr, stderr)

  if (result.error) {
    stderr('Admin media upload-delete QA failed to start safely.')
    return 1
  }

  return result.status ?? 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAdminMediaUploadDeleteQaCli({ allowTsxRerun: true })
    .then((status) => {
      process.exit(status)
    })
    .catch(() => {
      console.error('Admin media upload-delete QA failed before aggregate output was produced.')
      process.exit(1)
    })
}
