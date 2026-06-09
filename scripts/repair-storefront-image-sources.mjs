import { PrismaClient } from '@prisma/client'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

export const CATEGORY_IMAGE_REPAIRS = [
  { slug: 'electronics', image: '/assets/categories/electronics.jpg' },
  { slug: 'fashion', image: '/assets/categories/fashion.jpg' },
  { slug: 'home-appliances', image: '/assets/categories/home-appliances.jpg' },
  { slug: 'beauty-health', image: '/assets/categories/beauty-health.jpg' },
  { slug: 'sports-fitness', image: '/assets/categories/sports-fitness.jpg' },
  { slug: 'books-stationery', image: '/assets/categories/books-stationery.jpg' },
  { slug: 'gaming', image: '/assets/categories/gaming.jpg' },
  { slug: 'toys-collectibles', image: '/assets/categories/toys-collectibles.jpg' },
]

export const BANNER_IMAGE_REPAIRS = []

export function createStorefrontImageRepairPlan({
  cwd = process.cwd(),
  baseEnv = process.env,
} = {}) {
  const env = loadEnv({ cwd, baseEnv })
  const safety = evaluateDatabaseSafety(env)

  return {
    env,
    safety,
    canRun: safety.safeForLocalMigration,
  }
}

export async function repairStorefrontImageSources({ prisma } = {}) {
  if (!prisma) throw new Error('A Prisma client is required')

  const categoryResults = []
  for (const repair of CATEGORY_IMAGE_REPAIRS) {
    const result = await prisma.category.updateMany({
      where: { slug: repair.slug },
      data: { image: repair.image },
    })
    categoryResults.push({ slug: repair.slug, count: result.count })
  }

  const bannerResults = []
  for (const repair of BANNER_IMAGE_REPAIRS) {
    const result = await prisma.banner.updateMany({
      where: { imageUrl: repair.from },
      data: { imageUrl: repair.to },
    })
    bannerResults.push({ label: repair.label, count: result.count })
  }

  return {
    categories: categoryResults,
    banners: bannerResults,
  }
}

export async function runStorefrontImageRepairCli({
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  PrismaClientCtor = PrismaClient,
} = {}) {
  const plan = createStorefrontImageRepairPlan({ cwd, baseEnv })

  stdout('Storefront image source repair guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)

  if (!plan.canRun) {
    stderr('Refusing to repair storefront image sources: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
    return 1
  }

  const prisma = new PrismaClientCtor({
    datasources: {
      db: {
        url: plan.env.DATABASE_URL,
      },
    },
  })

  try {
    const results = await repairStorefrontImageSources({ prisma })
    for (const result of results.categories) {
      stdout(`Category ${result.slug}: ${result.count} row(s) updated.`)
    }
    for (const result of results.banners) {
      stdout(`${result.label}: ${result.count} row(s) updated.`)
    }
    return 0
  } catch {
    stderr('Storefront image source repair failed.')
    return 1
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  runStorefrontImageRepairCli()
    .then((status) => process.exit(status))
    .catch(() => {
      console.error('Storefront image source repair failed.')
      process.exit(1)
    })
}
