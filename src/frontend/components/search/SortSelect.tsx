'use client'

interface SortOption { value: string; label: string }

export function SortSelect({ current, options }: { current: string; options: SortOption[] }) {
  return (
    <select aria-label="Sort products" title="Sort products"
      defaultValue={current}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('sort', e.target.value)
        url.searchParams.delete('page')
        window.location.href = url.toString()
      }}
      className="rounded-full border border-input bg-background px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring sm:rounded-lg sm:px-3 sm:text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
