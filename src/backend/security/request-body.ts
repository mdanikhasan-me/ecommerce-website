import { NextResponse } from 'next/server'

const JSON_CONTENT_TYPE_PATTERN = /^(?:application\/json|[^;/]+\/[^;/]+\+json)(?:\s*;|$)/i

export const JSON_BODY_LIMITS = {
  tiny: 4 * 1024,
  standard: 16 * 1024,
  collection: 128 * 1024,
  catalogEditor: 1024 * 1024,
} as const

type BoundedJsonResult =
  | { success: true; data: unknown }
  | { success: false; response: NextResponse }

type BoundedTextResult =
  | { success: true; data: string }
  | { success: false; response: NextResponse }

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
    },
  )
}

export function rejectDeclaredBodyLargerThan(request: Request, maxBytes: number) {
  const contentLengthHeader = request.headers.get('content-length')
  if (!contentLengthHeader) return null

  const contentLength = Number(contentLengthHeader)
  if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
    return errorResponse('Invalid Content-Length', 400)
  }

  return contentLength > maxBytes
    ? errorResponse('Request body is too large', 413)
    : null
}

export async function readBoundedTextBody(
  request: Request,
  maxBytes: number,
): Promise<BoundedTextResult> {
  const oversized = rejectDeclaredBodyLargerThan(request, maxBytes)
  if (oversized) return { success: false, response: oversized }

  if (!request.body) {
    return { success: false, response: errorResponse('Request body is required', 400) }
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel('Request body is too large').catch(() => undefined)
        return { success: false, response: errorResponse('Request body is too large', 413) }
      }
      chunks.push(value)
    }

    const body = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }

    return { success: true, data: new TextDecoder('utf-8', { fatal: true }).decode(body) }
  } catch {
    return { success: false, response: errorResponse('Invalid request body', 400) }
  } finally {
    reader.releaseLock()
  }
}

export async function readBoundedJsonBody(
  request: Request,
  maxBytes: number,
): Promise<BoundedJsonResult> {
  const contentType = request.headers.get('content-type')?.trim() ?? ''
  if (!JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
    return { success: false, response: errorResponse('Content-Type must be application/json', 415) }
  }

  const body = await readBoundedTextBody(request, maxBytes)
  if (!body.success) return body

  try {
    return { success: true, data: JSON.parse(body.data) as unknown }
  } catch {
    return { success: false, response: errorResponse('Invalid JSON request body', 400) }
  }
}
