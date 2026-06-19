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
      className="h-10 max-w-[10.75rem] rounded-full border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-none sm:rounded-lg sm:px-3 sm:text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
