import { NextRequest, NextResponse } from 'next/server'
import {
  persistAdminCategoryImageFile,
  type AdminCategoryUploadFile,
} from '@/backend/admin/category-image-upload'
import { persistAdminSubcategoryIconFile } from '@/backend/admin/category-icon-upload'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { rejectDeclaredBodyLargerThan } from '@/backend/security/request-body'
import { MAX_IMAGE_UPLOAD_BYTES } from '@/backend/admin/image-processing'

const MAX_MULTIPART_BODY_BYTES = MAX_IMAGE_UPLOAD_BYTES + 128 * 1024

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

    const oversized = rejectDeclaredBodyLargerThan(req, MAX_MULTIPART_BODY_BYTES)
    if (oversized) return oversized

    const formData = await req.formData()
    const file = formData.get('file')
    if (!isUploadFile(file)) {
      throw new Error('Image file is required')
    }

    const owner = getStringValue(formData, 'owner') || 'category'
    const kind = getStringValue(formData, 'kind').toLowerCase()

    const url =
      kind === 'subcategory'
        ? await persistAdminSubcategoryIconFile(file, { ownerSlugOrId: owner })
        : await persistAdminCategoryImageFile(file, { ownerSlugOrId: owner })

    return NextResponse.json({ url })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to upload category image')
    return NextResponse.json({ error: message }, { status })
  }
}
