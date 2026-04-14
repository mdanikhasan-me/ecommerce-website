import Link from 'next/link'

interface AdminPlaceholderPanelProps {
  title: string
  description: string
  backHref: string
  backLabel: string
  notes?: string[]
}

export function AdminPlaceholderPanel({
  title,
  description,
  backHref,
  backLabel,
  notes = [],
}: AdminPlaceholderPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          This screen is now routed correctly, but the full editor workflow is still being built.
        </p>
        {notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
        <div className="mt-5">
          <Link href={backHref} className="btn-outline">
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
