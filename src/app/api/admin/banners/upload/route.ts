import { NextRequest, NextResponse } from 'next/server'
import {
  deleteManagedAdminUpload,
  deleteReplacedAdminUploads,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import {
  persistAdminBannerImageFile,
  type AdminBannerUploadFile,
} from '@/backend/admin/banner-image-upload'
import { isAdminBannerImageSlot } from '@/backend/admin/banner-image-policy'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody, rejectDeclaredBodyLargerThan } from '@/backend/security/request-body'
import { MAX_IMAGE_UPLOAD_BYTES } from '@/backend/admin/image-processing'

const MAX_MULTIPART_BODY_BYTES = MAX_IMAGE_UPLOAD_BYTES + 128 * 1024

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isUploadFile(value: unknown): value is AdminBannerUploadFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AdminBannerUploadFile).arrayBuffer === 'function' &&
    typeof (value as AdminBannerUploadFile).size === 'number' &&
    typeof (value as AdminBannerUploadFile).type === 'string'
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
    const slot = getStringValue(formData, 'slot')
    if (!isAdminBannerImageSlot(slot)) {
      throw new Error('Banner image slot is invalid')
    }

    const file = formData.get('file')
    if (!isUploadFile(file)) {
      throw new Error('Image file is required')
    }

    const url = await persistAdminBannerImageFile(file, {
      ownerSlugOrId: getStringValue(formData, 'owner') || 'banner',
      slot,
    })

    await deleteReplacedAdminUploads([getStringValue(formData, 'previousUrl')], [url])

    return NextResponse.json({ url })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to upload banner image')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const input = body.data as Record<string, unknown>
    const url = typeof input?.url === 'string' ? input.url.trim() : ''
    if (!url) throw new Error('Banner image URL is required')

    const deleted = await deleteManagedAdminUpload(url)
    return NextResponse.json({ deleted })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to remove banner image')
    return NextResponse.json({ error: message }, { status })
  }
}
