/**
 * JSON-LD Component
 *
 * Server component that renders structured data as a <script> tag.
 * Supports single or multiple schema objects per page.
 * Google recommends JSON-LD over Microdata or RDFa.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

const JSON_LD_ESCAPE_MAP: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => JSON_LD_ESCAPE_MAP[char] ?? char)
}

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  )
}
