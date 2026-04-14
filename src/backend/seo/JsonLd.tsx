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

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
