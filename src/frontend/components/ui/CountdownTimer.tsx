'use client'

import { useEffect, useMemo, useState } from 'react'

interface CountdownTimerProps {
  endsAt: Date | string
  label?: string
  className?: string
  valueClassName?: string
  separatorClassName?: string
}

export function CountdownTimer({
  endsAt,
  label,
  className = '',
  valueClassName = '',
  separatorClassName = '',
}: CountdownTimerProps) {
  const endTime = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTime))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endTime))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [endTime])

  return (
    <div className={className}>
      {label ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.75]">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((value, index) => (
          <span key={`${value}-${index}`} className="flex items-center gap-1.5">
            <span className={valueClassName}>{value}</span>
            {index < 2 ? <span className={separatorClassName}>:</span> : null}
          </span>
        ))}
      </div>
    </div>
  )
}

function getTimeLeft(endTime: number) {
  const diff = Math.max(0, endTime - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return { h: hours, m: minutes, s: seconds }
}
