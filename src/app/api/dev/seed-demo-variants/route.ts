import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { NextResponse } from 'next/server'
import { revalidateProductSurfaces } from '@/backend/catalog/storefront-revalidation'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const scriptPath = path.join(process.cwd(), 'prisma', 'seed-demo-variant-products.mjs')

  try {
    const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: process.env,
      timeout: 120_000,
      windowsHide: true,
    })

    revalidateProductSurfaces({
      productSlugs: [
        'air-jordan-1-retro-high-og-demo',
        'galaxy-s24-ultra-variant-demo',
      ],
      categorySlugs: ['fashion', 'mens-fashion', 'electronics', 'mobile-phones'],
    })

    return NextResponse.json({
      ok: true,
      output: stdout.trim().split(/\r?\n/).filter(Boolean),
    })
  } catch (error) {
    console.error('Failed to seed demo variant products', error)
    return NextResponse.json({ error: 'Failed to seed demo variant products' }, { status: 500 })
  }
}
