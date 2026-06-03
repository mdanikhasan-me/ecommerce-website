import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const repoRoot = process.cwd()
const forbiddenActivePattern = /flash[\s_-]*(sale|deal)s?|FlashSale|FlashDeal|\/deals/i

const activeTargets = [
  'src',
  'prisma/schema.prisma',
  'prisma/seed.ts',
  'scripts',
  'README.md',
  'expanded-folders.txt',
  'project-folders.txt',
]

function collectFiles(target: string): string[] {
  const absolutePath = join(repoRoot, target)
  if (!existsSync(absolutePath)) return []

  const stat = statSync(absolutePath)
  if (stat.isFile()) return [absolutePath]

  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(target, entry)))
}

test('Flash Deals is absent from active source, schema, seed, scripts, and docs', () => {
  const offenders = activeTargets.flatMap((target) =>
    collectFiles(target).filter((file) => forbiddenActivePattern.test(readFileSync(file, 'utf8')))
  )

  assert.deepEqual(offenders.map((file) => file.replace(`${repoRoot}\\`, '')).sort(), [])
})

test('Flash Deals storefront and admin routes are removed', () => {
  assert.equal(existsSync(join(repoRoot, 'src/app/(store)/deals/page.tsx')), false)
  assert.equal(existsSync(join(repoRoot, 'src/app/(admin)/admin/flash-sales/page.tsx')), false)
  assert.equal(existsSync(join(repoRoot, 'src/app/api/admin/flash-sales/route.ts')), false)
})
