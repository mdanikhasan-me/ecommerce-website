import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { revalidateHomeSurface } from '@/backend/catalog/storefront-revalidation'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminHomepageSectionPayload } from '@/backend/admin/homepage-section-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const parsed = parseAdminHomepageSectionPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data

    const section = await db.homepageSection.create({
      data: {
        type: payload.type,
        title: payload.title,
        subtitle: payload.subtitle,
        config: payload.config,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      },
    })

    revalidateHomeSurface()
    revalidatePath('/admin/content')

    return NextResponse.json({ section }, { status: 201 })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to create section')
    return NextResponse.json({ error: message }, { status })
  }
}
