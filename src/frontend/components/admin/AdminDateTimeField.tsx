'use client'

import { Clock3, X } from 'lucide-react'

type AdminDateTimeFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  allowNow?: boolean
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function pad(value: number | string) {
  return String(value).padStart(2, '0')
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function toLocalDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AdminDateTimeField({
  id,
  label,
  value,
  onChange,
  helperText,
  allowNow = false,
}: AdminDateTimeFieldProps) {
  const [datePart = '', time = ''] = value.split('T')
  const [year = '', month = '', day = ''] = datePart.split('-')
  const currentYear = new Date().getFullYear()
  const selectedYear = Number(year) || currentYear
  const selectedMonth = Number(month) || 1
  const maxDay = daysInMonth(selectedYear, selectedMonth)
  const yearOptions = Array.from({ length: 21 }, (_, index) => currentYear - 1 + index)
  if (year && !yearOptions.includes(Number(year))) yearOptions.unshift(Number(year))

  const commit = (next: { year?: string; month?: string; day?: string; time?: string }) => {
    const nextYear = next.year ?? year ?? String(currentYear)
    const nextMonth = next.month ?? month
    if (!nextMonth) {
      onChange('')
      return
    }
    const nextMaxDay = daysInMonth(Number(nextYear), Number(nextMonth))
    const nextDay = pad(Math.min(Number(next.day ?? day) || 1, nextMaxDay))
    const nextTime = (next.time ?? time) || '00:00'
    onChange(`${nextYear}-${pad(nextMonth)}-${nextDay}T${nextTime}`)
  }

  return (
    <fieldset>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <legend className="text-sm font-medium">{label}</legend>
        {allowNow ? (
          <button type="button" onClick={() => onChange(toLocalDateTime(new Date()))} className="text-xs font-semibold text-primary">
            Use now
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1.25fr)_4.75rem_5.75rem]">
        <label className="sr-only" htmlFor={`${id}-month`}>{label} month</label>
        <select
          id={`${id}-month`}
          value={month}
          onChange={(event) => commit({ month: event.target.value })}
          className="input-base col-span-2 sm:col-span-1"
        >
          <option value="">Month</option>
          {MONTHS.map((monthName, index) => <option key={monthName} value={pad(index + 1)}>{monthName}</option>)}
        </select>

        <label className="sr-only" htmlFor={`${id}-day`}>{label} day</label>
        <select
          id={`${id}-day`}
          value={month ? day : ''}
          disabled={!month}
          onChange={(event) => commit({ day: event.target.value })}
          className="input-base"
        >
          <option value="">Day</option>
          {Array.from({ length: maxDay }, (_, index) => index + 1).map((dayValue) => (
            <option key={dayValue} value={pad(dayValue)}>{dayValue}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`${id}-year`}>{label} year</label>
        <select
          id={`${id}-year`}
          value={month ? year : ''}
          disabled={!month}
          onChange={(event) => commit({ year: event.target.value })}
          className="input-base"
        >
          <option value="">Year</option>
          {yearOptions.map((yearValue) => <option key={yearValue} value={yearValue}>{yearValue}</option>)}
        </select>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_2.5rem] gap-2">
        <div className="relative">
          <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <label className="sr-only" htmlFor={`${id}-time`}>{label} time</label>
          <input
            id={`${id}-time`}
            type="time"
            value={time}
            disabled={!month}
            onChange={(event) => commit({ time: event.target.value })}
            className="input-base pl-9"
          />
        </div>
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          title={`Clear ${label.toLowerCase()}`}
          disabled={!value}
          onClick={() => onChange('')}
          className="admin-icon-button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {helperText ? <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{helperText}</p> : null}
    </fieldset>
  )
}
