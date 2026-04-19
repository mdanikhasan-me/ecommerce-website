'use client'

interface SortOption { value: string; label: string }

export function SortSelect({ current, options }: { current: string; options: SortOption[] }) {
  return (
    <select aria-label="Select option" title="Select option"
      defaultValue={current}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('sort', e.target.value)
        window.location.href = url.toString()
      }}
      className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
