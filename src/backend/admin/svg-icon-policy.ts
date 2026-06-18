// Security policy for admin-uploaded subcategory icon SVGs.
//
// SVG is otherwise rejected across this codebase (banners/category photos) because a
// raw SVG served same-origin can carry scripts/external references. Subcategory icons
// are the one place we accept SVG, so every upload is run through fail-closed validation
// here before it is written to /public. Anything that could execute script, reach the
// network, or parse external entities is rejected outright rather than "cleaned".

export const MAX_SVG_ICON_BYTES = 64 * 1024

export const SVG_ICON_ERROR_MESSAGES = {
  required: 'An SVG icon file is required',
  tooLarge: 'SVG icon is too large (max 64 KB)',
  notSvg: 'File must be a valid <svg> icon',
  unsafe: 'SVG icon contains markup that is not allowed (scripts, event handlers, external or embedded references)',
} as const

// Markup that must never appear in an uploaded icon. Checked against a lowercased copy.
const FORBIDDEN_PATTERNS: RegExp[] = [
  /<!doctype/i,
  /<!entity/i,
  /<!\[cdata\[/i,
  /<\?xml-stylesheet/i,
  /<script[\s>]/i,
  /<foreignobject[\s>]/i,
  /<iframe[\s>]/i,
  /<embed[\s>]/i,
  /<object[\s>]/i,
  /<audio[\s>]/i,
  /<video[\s>]/i,
  /<style[\s>]/i,
  /<animate[a-z]*[\s>]/i, // animation elements can carry event-like begin/end timing
  /\son[a-z]+\s*=/i, // inline event handlers: onload, onclick, ...
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  // any href/xlink:href/src pointing off-document (external, protocol-relative, data, script)
  /(?:xlink:href|href|src)\s*=\s*["']?\s*(?:https?:|\/\/|data:|javascript:|vbscript:|file:)/i,
]

function stripXmlPrologue(svg: string) {
  return svg
    .replace(/^﻿/, '') // BOM
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
}

export function validateAndSanitizeSvgIcon(input: string | null | undefined): string {
  const raw = typeof input === 'string' ? input.trim() : ''
  if (!raw) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.required)
  }

  if (Buffer.byteLength(raw, 'utf8') > MAX_SVG_ICON_BYTES) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.tooLarge)
  }

  const lower = raw.toLowerCase()
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(lower)) {
      throw new Error(SVG_ICON_ERROR_MESSAGES.unsafe)
    }
  }

  const cleaned = stripXmlPrologue(raw)
  if (!/^<svg[\s>]/i.test(cleaned) || !/<\/svg>\s*$/i.test(cleaned)) {
    throw new Error(SVG_ICON_ERROR_MESSAGES.notSvg)
  }

  // Re-check the cleaned markup in case the prologue masked a forbidden token boundary.
  const cleanedLower = cleaned.toLowerCase()
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(cleanedLower)) {
      throw new Error(SVG_ICON_ERROR_MESSAGES.unsafe)
    }
  }

  return cleaned
}

export function isSubcategoryIconPath(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return false
  return trimmed.startsWith('/assets/categories/subcategories/') && trimmed.toLowerCase().endsWith('.svg')
}
