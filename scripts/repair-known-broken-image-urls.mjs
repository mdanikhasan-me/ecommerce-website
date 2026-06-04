import { PrismaClient } from '@prisma/client'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

import {
  evaluateDatabaseSafety,
  loadEnv,
  printDatabaseSafetyReport,
} from './check-db-url-safety.mjs'

export const KNOWN_BROKEN_IMAGE_REPLACEMENTS = [
  {
    label: 'iPhone 15 Pro product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format',
    to: '/assets/banners/home-hero-iphone-15-pro.jpg',
  },
  {
    label: 'Samsung Galaxy S24 Ultra legacy product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=800&auto=format',
    to: '/uploads/products/samsung-galaxy-s24-ultra-256gb-mnyzjwut-55e72c0c.jpg',
  },
  {
    label: 'Samsung Galaxy S24 Ultra current product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format',
    to: '/uploads/products/samsung-galaxy-s24-ultra-256gb-mnyzjwut-55e72c0c.jpg',
  },
  {
    label: 'Anker 737 Power Bank product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1609428614116-c91f3c1eac77?w=800&auto=format',
    to: '/uploads/products/anker-737-power-bank-24000mah-mnyzif42-a41aa5a6.webp',
  },
  {
    label: 'Anker 511 Nano Pro charger product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format',
    to: '/uploads/products/anker-511-nano-pro-65w-charger-mnyzoikz-37e76524.jpg',
  },
  {
    label: 'Dell UltraSharp 27 4K monitor product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format',
    to: '/uploads/products/dell-ultrasharp-27-4k-usb-c-u2723de-mnyzrjgz-759f7168.jpg',
  },
  {
    label: 'Samsung Galaxy Tab S9 product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1673841464843-af1c5c8b8c54?w=800&auto=format',
    to: '/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwuo-057009f0.jpg',
  },
  {
    label: 'Samsung Galaxy Tab S9 current product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format',
    to: '/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwuo-057009f0.jpg',
  },
  {
    label: 'Xiaomi Redmi Note 13 Pro product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format',
    to: '/uploads/products/xiaomi-redmi-note-13-pro-256gb-mnyvj84s-d6198d84.webp',
  },
  {
    label: 'Galaxy S24 Ultra hero banner image',
    model: 'banner',
    field: 'imageUrl',
    from: 'https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=1600&auto=format',
    to: '/assets/banners/home-hero-galaxy-s24-ultra.jpg',
  },
]

export function createKnownBrokenImageRepairPlan({
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

export async function repairKnownBrokenImageUrls({ prisma, replacements = KNOWN_BROKEN_IMAGE_REPLACEMENTS } = {}) {
  const results = []

  for (const replacement of replacements) {
    if (replacement.model === 'productImage') {
      const result = await prisma.productImage.updateMany({
        where: { [replacement.field]: replacement.from },
        data: { [replacement.field]: replacement.to },
      })
      results.push({ label: replacement.label, count: result.count })
      continue
    }

    if (replacement.model === 'banner') {
      const result = await prisma.banner.updateMany({
        where: { [replacement.field]: replacement.from },
        data: { [replacement.field]: replacement.to },
      })
      results.push({ label: replacement.label, count: result.count })
      continue
    }

    throw new Error(`Unsupported image repair model: ${replacement.model}`)
  }

  return results
}

export async function runKnownBrokenImageRepairCli({
  cwd = process.cwd(),
  baseEnv = process.env,
  stdout = console.log,
  stderr = console.error,
  PrismaClientCtor = PrismaClient,
} = {}) {
  const plan = createKnownBrokenImageRepairPlan({ cwd, baseEnv })

  stdout('Known image URL repair guardrail: .env is loaded first, then .env.local overrides it when present.')
  printDatabaseSafetyReport(plan.safety, stdout)

  if (!plan.canRun) {
    stderr('Refusing to repair image URLs: DATABASE_URL and SHADOW_DATABASE_URL must both be local and separate.')
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
    const results = await repairKnownBrokenImageUrls({ prisma })
    for (const result of results) {
      stdout(`${result.label}: ${result.count} row(s) updated.`)
    }
    return 0
  } catch {
    stderr('Known image URL repair failed.')
    return 1
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  runKnownBrokenImageRepairCli()
    .then((status) => process.exit(status))
    .catch(() => {
      console.error('Known image URL repair failed.')
      process.exit(1)
    })
}
