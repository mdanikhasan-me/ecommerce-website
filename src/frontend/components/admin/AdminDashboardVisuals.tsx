'use client'

import { useState } from 'react'
import Link from 'next/link'

const CHART_WIDTH = 720
const CHART_HEIGHT = 230
const CHART_LEFT = 62
const CHART_RIGHT = 18
const CHART_TOP = 20
const CHART_BOTTOM = 34

type ChartMetric = 'revenue' | 'orders'
type ChartRange = 7 | 14 | 30
const CHART_RANGES: ChartRange[] = [7, 14, 30]

interface ActivityPoint {
  date: string
  label: string
  revenue: number
  orders: number
}

interface OutcomePoint {
  id: string
  label: string
  description: string
  count: number
  color: string
}

interface AdminDashboardVisualsProps {
  activity: ActivityPoint[]
  chartDays: ChartRange
  metric: ChartMetric
  outcomeDays: ChartRange
  outcomes: OutcomePoint[]
}

function formatMetricValue(metric: ChartMetric, value: number) {
  if (metric === 'revenue') {
    return `Tk ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)}`
  }
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 1 }).format(value)
}

function handleKeyboardSelect(event: React.KeyboardEvent<SVGGElement>, select: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  select()
}

export function AdminDashboardVisuals({ activity, chartDays, metric, outcomeDays, outcomes }: AdminDashboardVisualsProps) {
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(Math.max(activity.length - 1, 0))
  const [selectedOutcomeId, setSelectedOutcomeId] = useState(
    outcomes.find((outcome) => outcome.id === 'completed')?.id ?? outcomes[0]?.id ?? '',
  )
  const values = activity.map((item) => item[metric])
  const maximum = Math.max(...values, 1)
  const availableWidth = CHART_WIDTH - CHART_LEFT - CHART_RIGHT
  const availableHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM
  const stepWidth = availableWidth / Math.max(activity.length, 1)
  const baseline = CHART_HEIGHT - CHART_BOTTOM
  const points = values.map((value, index) => ({
    x: CHART_LEFT + stepWidth * index + stepWidth / 2,
    y: baseline - (value / maximum) * availableHeight,
  }))
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = points.length
    ? `M ${points[0].x} ${baseline} L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points.at(-1)?.x ?? CHART_WIDTH - CHART_RIGHT} ${baseline} Z`
    : ''
  const selectedActivity = activity[selectedActivityIndex]
  const periodTotal = values.reduce((sum, value) => sum + value, 0)
  const peakValue = Math.max(...values, 0)
  const peakIndex = Math.max(values.indexOf(peakValue), 0)
  const totalOutcomes = outcomes.reduce((sum, outcome) => sum + outcome.count, 0)
  const selectedOutcome = outcomes.find((outcome) => outcome.id === selectedOutcomeId) ?? outcomes[0]
  let outcomeOffset = 0

  return (
    <div className="grid min-w-0 xl:grid-cols-2">
      <section className="min-w-0 p-4 sm:p-5 lg:p-6" aria-labelledby="dashboard-activity-chart">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="dashboard-activity-chart" className="text-sm font-bold">
              Daily {metric === 'revenue' ? 'revenue' : 'orders'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex min-h-10 items-center rounded-md bg-secondary/65 p-1" aria-label="Graph metric">
              {(['revenue', 'orders'] as const).map((option) => (
                <Link
                  key={option}
                  href={{ pathname: '/admin/dashboard', query: { chartRange: chartDays, outcomeRange: outcomeDays, metric: option } }}
                  aria-current={metric === option ? 'page' : undefined}
                  className={`inline-flex min-h-8 items-center rounded px-3 text-xs font-semibold ${metric === option ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
                >
                  {option === 'revenue' ? 'Revenue' : 'Orders'}
                </Link>
              ))}
            </nav>
            <nav className="flex min-h-10 items-center rounded-md bg-secondary/65 p-1" aria-label="Graph period">
              {CHART_RANGES.map((range) => (
                <Link
                  key={range}
                  href={{ pathname: '/admin/dashboard', query: { chartRange: range, outcomeRange: outcomeDays, metric } }}
                  aria-current={chartDays === range ? 'page' : undefined}
                  className={`inline-flex min-h-8 min-w-10 items-center justify-center rounded px-2 text-xs font-semibold ${chartDays === range ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
                >
                  {range}D
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Hover, focus, or tap a point to inspect it.</p>
          <div className="min-w-28 rounded-md bg-secondary/65 px-3 py-2 text-right" aria-live="polite" data-chart-inspection>
            <p className="text-[11px] font-medium text-muted-foreground">{selectedActivity?.label ?? 'No activity'}</p>
            <p className="mt-0.5 text-sm font-bold">
              {formatMetricValue(metric, selectedActivity?.[metric] ?? 0)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-secondary/45 px-2 py-3 sm:px-3">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-52 w-full overflow-visible"
            role="img"
            aria-label={`Interactive ${metric} chart`}
          >
            {[0, 0.5, 1].map((ratio) => {
              const y = CHART_TOP + ratio * availableHeight
              return (
                <g key={ratio} className="text-muted-foreground">
                  <line
                    x1={CHART_LEFT}
                    x2={CHART_WIDTH - CHART_RIGHT}
                    y1={y}
                    y2={y}
                    className="stroke-border"
                    strokeDasharray={ratio === 1 ? undefined : '4 6'}
                    vectorEffect="non-scaling-stroke"
                  />
                  <text x={CHART_LEFT - 9} y={y + 4} textAnchor="end" className="hidden fill-current text-[10px] sm:block">
                    {formatMetricValue(metric, maximum * (1 - ratio))}
                  </text>
                </g>
              )
            })}

            {metric === 'revenue' ? (
              <>
                <path d={areaPath} fill="#2563eb" opacity="0.09" />
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            ) : null}

            {points.map((point, index) => {
              const value = values[index]
              const isSelected = index === selectedActivityIndex
              const select = () => setSelectedActivityIndex(index)
              const barWidth = Math.max(6, stepWidth * 0.56)
              return (
                <g
                  key={activity[index].date}
                  role="button"
                  tabIndex={0}
                  aria-label={`${activity[index].label}: ${formatMetricValue(metric, value)}`}
                  onMouseEnter={select}
                  onFocus={select}
                  onClick={select}
                  onKeyDown={(event) => handleKeyboardSelect(event, select)}
                  className="cursor-pointer outline-none"
                >
                  {metric === 'orders' ? (
                    <>
                      <rect
                        x={point.x - stepWidth / 2}
                        y={CHART_TOP}
                        width={stepWidth}
                        height={availableHeight}
                        fill="transparent"
                      />
                      <rect
                        x={point.x - barWidth / 2}
                        y={point.y}
                        width={barWidth}
                        height={Math.max(2, baseline - point.y)}
                        rx="3"
                        fill={isSelected ? '#2563eb' : '#58769f'}
                      />
                    </>
                  ) : (
                    <>
                      <circle cx={point.x} cy={point.y} r="14" fill="transparent" />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? 6 : 4}
                        fill={isSelected ? '#2563eb' : 'hsl(var(--card))'}
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="flex justify-between pl-12 text-[11px] font-medium text-muted-foreground sm:pl-14">
            <span>{activity[0]?.label}</span>
            <span>{activity[Math.floor(activity.length / 2)]?.label}</span>
            <span>{activity.at(-1)?.label}</span>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-md bg-secondary/55 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Period total</dt>
            <dd className="mt-1 truncate text-sm font-bold">{formatMetricValue(metric, periodTotal)}</dd>
          </div>
          <div className="rounded-md bg-secondary/55 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Daily average</dt>
            <dd className="mt-1 truncate text-sm font-bold">{formatMetricValue(metric, periodTotal / Math.max(activity.length, 1))}</dd>
          </div>
          <div className="rounded-md bg-secondary/55 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-muted-foreground">Peak · {activity[peakIndex]?.label}</dt>
            <dd className="mt-1 truncate text-sm font-bold">{formatMetricValue(metric, peakValue)}</dd>
          </div>
        </dl>
      </section>

      <section className="min-w-0 border-t border-border/70 p-4 sm:p-5 lg:p-6 xl:border-l xl:border-t-0" aria-labelledby="dashboard-outcome-diagram">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="dashboard-outcome-diagram" className="text-sm font-bold">Order outcome diagram</h3>
            <p className="mt-1 text-xs text-muted-foreground">Select a segment to inspect its share of recorded orders.</p>
          </div>
          <nav className="flex min-h-10 items-center rounded-md bg-secondary/65 p-1" aria-label="Outcome period">
            {CHART_RANGES.map((range) => (
              <Link
                key={range}
                href={{ pathname: '/admin/dashboard', query: { chartRange: chartDays, outcomeRange: range, metric } }}
                aria-current={outcomeDays === range ? 'page' : undefined}
                className={`inline-flex min-h-8 min-w-10 items-center justify-center rounded px-2 text-xs font-semibold ${outcomeDays === range ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
              >
                {range}D
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-5 grid items-center gap-5 sm:grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)] 2xl:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="relative mx-auto aspect-square w-44 sm:w-48 xl:w-44 2xl:w-52">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="Selectable order outcome diagram">
              <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="15" />
              {outcomes.map((outcome) => {
                const percentage = totalOutcomes ? (outcome.count / totalOutcomes) * 100 : 0
                const offset = outcomeOffset
                outcomeOffset += percentage
                const isSelected = outcome.id === selectedOutcome?.id
                const select = () => setSelectedOutcomeId(outcome.id)
                return (
                  <circle
                    key={outcome.id}
                    cx="60"
                    cy="60"
                    r="45"
                    pathLength="100"
                    fill="none"
                    stroke={outcome.color}
                    strokeWidth={isSelected ? 18 : 14}
                    strokeDasharray={`${percentage} ${100 - percentage}`}
                    strokeDashoffset={-offset}
                    role="button"
                    tabIndex={0}
                    aria-label={`${outcome.label}: ${Math.round(percentage)} percent, ${outcome.count} orders`}
                    onMouseEnter={select}
                    onFocus={select}
                    onClick={select}
                    onKeyDown={(event) => handleKeyboardSelect(event, select)}
                    className="cursor-pointer outline-none"
                  />
                )
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center" aria-live="polite">
              <strong className="font-display text-3xl">{totalOutcomes ? Math.round(((selectedOutcome?.count ?? 0) / totalOutcomes) * 100) : 0}%</strong>
              <span className="mt-1 text-xs font-semibold">{selectedOutcome?.label ?? 'No orders'}</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">{selectedOutcome?.count ?? 0} of {totalOutcomes}</span>
            </div>
          </div>

          <div className="grid gap-1.5">
            {outcomes.map((outcome) => {
              const percentage = totalOutcomes ? Math.round((outcome.count / totalOutcomes) * 100) : 0
              const isSelected = outcome.id === selectedOutcome?.id
              return (
                <button
                  key={outcome.id}
                  type="button"
                  onMouseEnter={() => setSelectedOutcomeId(outcome.id)}
                  onFocus={() => setSelectedOutcomeId(outcome.id)}
                  onClick={() => setSelectedOutcomeId(outcome.id)}
                  aria-pressed={isSelected}
                  data-outcome-selected={isSelected ? 'true' : undefined}
                  className={`grid min-h-11 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2.5 py-2 text-left ${isSelected ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                >
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: outcome.color }} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-foreground">{outcome.label}</span>
                    <span className="block truncate text-[10px]">{outcome.description}</span>
                  </span>
                  <span className="text-right">
                    <strong className="block text-sm text-foreground">{percentage}%</strong>
                    <span className="block text-[10px]">{outcome.count}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
