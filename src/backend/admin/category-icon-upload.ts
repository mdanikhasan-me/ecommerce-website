import { Buffer } from 'node:buffer'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { sanitizeMediaPathSegment } from '@/backend/admin/media-paths'
import {
  MAX_SVG_ICON_BYTES,
  SVG_ICON_ERROR_MESSAGES,
  validateAndSanitizeSvgIcon,
} from '@/backend/admin/svg-icon-policy'

export type AdminSubcategoryIconFile = {
  arrayBuffer: () => Promise<ArrayBuffer>
  size: number
  type: string
  name?: string
}

const SUBCATEGORY_ICON_PUBLIC_PREFIX = '/assets/categories/subcategories'
const SUBCATEGORY_ICON_DIR_SEGMENTS = ['assets', 'categories', 'subcategories']

function looksLikeSvgUpload(file: AdminSubcategoryIconFile) {
  const mime = file.type.trim().toLowerCase()
  if (mime === 'image/svg+xml' || mime === 'text/xml' || mime === 'application/xml' || mime === '') {
    return true
  }
  return Boolean(file.name && file.name.trim().toLowerCase().endsWith('.svg'))
}

export async function persistAdminSubcategoryIconFile(
  file: AdminSubcategoryIconFile,
  input: { ownerSlugOrId?: string | null },
) {
  if (!file || file.size <= 0) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.required)
  }
  if (file.size > MAX_SVG_ICON_BYTES) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.tooLarge)
  }
  if (!looksLikeSvgUpload(file)) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.notSvg)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength <= 0 || buffer.byteLength > MAX_SVG_ICON_BYTES) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.tooLarge)
  }

  const safeSvg = validateAndSanitizeSvgIcon(buffer.toString('utf8'))

  const slug = sanitizeMediaPathSegment(input.ownerSlugOrId, 'subcategory')
  const fileName = `${slug}.svg`
  const publicRoot = path.resolve(process.cwd(), 'public')
  const directory = path.resolve(publicRoot, ...SUBCATEGORY_ICON_DIR_SEGMENTS)
  const filePath = path.resolve(directory, fileName)

  // Containment guard: never write outside the managed subcategory icon directory.
  if (filePath !== path.resolve(directory, `${slug}.svg`) || !filePath.startsWith(`${directory}${path.sep}`)) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.notSvg)
  }

  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(filePath, safeSvg, 'utf8')

  return `${SUBCATEGORY_ICON_PUBLIC_PREFIX}/${fileName}`
}
