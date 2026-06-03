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
    label: 'Samsung Galaxy S24 Ultra product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=800&auto=format',
    to: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format',
  },
  {
    label: 'Samsung Galaxy Tab S9 product image',
    model: 'productImage',
    field: 'url',
    from: 'https://images.unsplash.com/photo-1673841464843-af1c5c8b8c54?w=800&auto=format',
    to: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format',
  },
  {
    label: 'Galaxy S24 Ultra hero banner image',
    model: 'banner',
    field: 'imageUrl',
    from: 'https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=1600&auto=format',
    to: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600&auto=format',
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
