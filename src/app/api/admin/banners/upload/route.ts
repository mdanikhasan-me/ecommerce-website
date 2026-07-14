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

    const body = await req.json().catch(() => null)
    const url = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!url) throw new Error('Banner image URL is required')

    const deleted = await deleteManagedAdminUpload(url)
    return NextResponse.json({ deleted })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to remove banner image')
    return NextResponse.json({ error: message }, { status })
  }
}
