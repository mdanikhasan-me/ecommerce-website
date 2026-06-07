import { NextRequest, NextResponse } from 'next/server'
import {
  persistAdminCategoryImageFile,
  type AdminCategoryUploadFile,
} from '@/backend/admin/category-image-upload'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isUploadFile(value: unknown): value is AdminCategoryUploadFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AdminCategoryUploadFile).arrayBuffer === 'function' &&
    typeof (value as AdminCategoryUploadFile).size === 'number' &&
    typeof (value as AdminCategoryUploadFile).type === 'string'
  )
}

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const formData = await req.formData()
    const file = formData.get('file')
    if (!isUploadFile(file)) {
      throw new Error('Image file is required')
    }

    const url = await persistAdminCategoryImageFile(file, {
      ownerSlugOrId: getStringValue(formData, 'owner') || 'category',
    })

    return NextResponse.json({ url })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to upload category image')
    return NextResponse.json({ error: message }, { status })
  }
}
