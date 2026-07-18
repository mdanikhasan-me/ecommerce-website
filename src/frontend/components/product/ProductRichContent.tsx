import type { ReactNode } from 'react'

function isSafeHref(value: string) {
  return value.startsWith('/') || value.startsWith('#') || /^https?:\/\//i.test(value) || /^mailto:/i.test(value)
}

function renderInline(value: string, keyPrefix: string) {
  const tokens = value.split(/(\*\*.+?\*\*|`.+?`|\[[^\]]+\]\([^)]+\)|\*[^*]+?\*)/g).filter(Boolean)

  return tokens.map<ReactNode>((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={key} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">{token.slice(1, -1)}</code>
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }

    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link && isSafeHref(link[2].trim())) {
      const href = link[2].trim()
      const external = /^https?:\/\//i.test(href)
      return (
        <a
          key={key}
          href={href}
          className="font-medium text-primary underline decoration-primary/35 underline-offset-2"
          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        >
          {link[1]}
        </a>
      )
    }

    return token
  })
}

function startsBlock(value: string) {
  return /^(#{1,4})\s+/.test(value) || /^[-*+]\s+/.test(value) || /^\d+[.)]\s+/.test(value) || /^>\s?/.test(value)
}

export function ProductRichContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const raw = lines[index]
    const line = raw.trim()
    if (!line) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      const level = Math.min(heading[1].length + 1, 5)
      const classes = level === 2
        ? 'text-2xl sm:text-[1.75rem]'
        : level === 3
          ? 'text-xl sm:text-2xl'
          : 'text-lg sm:text-xl'
      const children = renderInline(heading[2], `heading-${index}`)
      if (level === 2) blocks.push(<h2 key={index} className={`font-display font-bold tracking-tight text-foreground ${classes}`}>{children}</h2>)
      else if (level === 3) blocks.push(<h3 key={index} className={`font-display font-bold tracking-tight text-foreground ${classes}`}>{children}</h3>)
      else blocks.push(<h4 key={index} className={`font-display font-semibold text-foreground ${classes}`}>{children}</h4>)
      index += 1
      continue
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>)}
        </ul>,
      )
      continue
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ''))
        index += 1
      }
      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-muted-foreground">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>)}
        </ol>,
      )
      continue
    }

    if (/^>\s?/.test(line)) {
      const quotes: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quotes.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-primary/45 bg-secondary/45 px-4 py-3 text-foreground/85">
          {renderInline(quotes.join(' '), `quote-${index}`)}
        </blockquote>,
      )
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index].trim())) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push(<p key={`p-${index}`}>{renderInline(paragraph.join(' '), `p-${index}`)}</p>)
  }

  return <div className="space-y-5 text-sm leading-7 text-foreground/80 sm:text-base">{blocks}</div>
}
