'use client'

import { useState, type KeyboardEvent } from 'react'

import styles from '@/app/(admin)/admin/reports/analytics.module.css'

const WIDTH = 760
const HEIGHT = 250
const LEFT = 78
const RIGHT = 18
const TOP = 20
const BOTTOM = 22
const NUMBER_FORMATTER = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 })

export interface AdminTrendChartPoint {
  label: string
  value: number
  position?: number
}

interface AdminTrendChartProps {
  title: string
  description: string
  points: AdminTrendChartPoint[]
  summaryPoints?: AdminTrendChartPoint[]
  valueType?: 'currency' | 'number'
  variant?: 'line' | 'bar'
  axisLabels?: readonly [string, string, string]
}

function formatValue(value: number, type: AdminTrendChartProps['valueType']) {
  const formatted = NUMBER_FORMATTER.format(value)
  return type === 'currency' ? `Tk ${formatted}` : formatted
}

function latestActiveIndex(points: AdminTrendChartPoint[]) {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index]?.value > 0) return index
  }
  return Math.max(points.length - 1, 0)
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return ''
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const midpoint = (previous.x + point.x) / 2
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

export function AdminTrendChart({
  title,
  description,
  points,
  summaryPoints,
  valueType = 'number',
  variant = 'line',
  axisLabels,
}: AdminTrendChartProps) {
  const safePoints = points.length ? points : [{ label: 'No activity', value: 0 }]
  const factPoints = summaryPoints?.length ? summaryPoints : safePoints
  const [selectedIndex, setSelectedIndex] = useState(() => latestActiveIndex(safePoints))
  const [hasInteracted, setHasInteracted] = useState(false)
  const activeIndex = Math.min(selectedIndex, safePoints.length - 1)
  const selected = safePoints[activeIndex]
  const values = safePoints.map((point) => Math.max(point.value, 0))
  const factValues = factPoints.map((point) => Math.max(point.value, 0))
  const maximum = Math.max(...values, 1)
  const chartWidth = WIDTH - LEFT - RIGHT
  const chartHeight = HEIGHT - TOP - BOTTOM
  const baseline = HEIGHT - BOTTOM
  const total = factValues.reduce((sum, value) => sum + value, 0)
  const average = total / Math.max(factValues.length, 1)
  const averageY = baseline - Math.min(average / maximum, 1) * chartHeight
  const peak = Math.max(...factValues, 0)
  const peakIndex = Math.max(factValues.indexOf(peak), 0)
  const fallbackStep = chartWidth / Math.max(safePoints.length - 1, 1)
  const plottedPoints = safePoints.map((point, index) => ({
    x: safePoints.length === 1
      ? LEFT + chartWidth / 2
      : LEFT + chartWidth * Math.min(Math.max(point.position ?? index / (safePoints.length - 1), 0), 1),
    y: baseline - (Math.max(point.value, 0) / maximum) * chartHeight,
  }))
  const tracePath = buildSmoothPath(plottedPoints)
  const areaPath = plottedPoints.length
    ? `${tracePath} L ${plottedPoints.at(-1)?.x ?? LEFT} ${baseline} L ${plottedPoints[0].x} ${baseline} Z`
    : ''
  const barWidth = Math.max(4, Math.min(10, (chartWidth / Math.max(safePoints.length, 1)) * 0.5))
  const labels = axisLabels ?? [
    safePoints[0]?.label ?? '',
    safePoints[Math.floor((safePoints.length - 1) / 2)]?.label ?? '',
    safePoints.at(-1)?.label ?? '',
  ]

  const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = Math.min(index + 1, safePoints.length - 1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = safePoints.length - 1
    else if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    setHasInteracted(true)
    setSelectedIndex(nextIndex)
    if (nextIndex !== index) {
      event.currentTarget.ownerSVGElement
        ?.querySelector<SVGGElement>(`[data-chart-index="${nextIndex}"]`)
        ?.focus()
    }
  }

  return (
    <article className={styles.chartCard}>
      <header className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>{title}</h2>
          <p className={styles.chartDescription}>{description}</p>
        </div>
        <div className={styles.chartInspection} aria-live="polite" data-chart-inspection>
          <span>{selected.label}</span>
          <strong>{formatValue(selected.value, valueType)}</strong>
        </div>
      </header>

      <div className={styles.chartStage}>
        <div className={styles.chartCanvas}>
          <div className={styles.yAxis} aria-hidden="true">
            <span>{formatValue(maximum, valueType)}</span>
            <span>{formatValue(maximum / 2, valueType)}</span>
            <span>{formatValue(0, valueType)}</span>
          </div>
          {average > 0 ? (
            <span
              className={styles.averageLabel}
              style={{ top: `${(averageY / HEIGHT) * 100}%` }}
              aria-hidden="true"
            >
              Average
            </span>
          ) : null}
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className={styles.chartSvg}
            role="group"
            aria-label={`Interactive ${title.toLowerCase()} ${variant} chart`}
          >
            <title>{`${title}: use arrow keys to inspect daily values`}</title>
          {[TOP, TOP + chartHeight / 2, baseline].map((y) => (
            <line
              key={y}
              x1={LEFT}
              x2={WIDTH - RIGHT}
              y1={y}
              y2={y}
              className={styles.gridLine}
              strokeDasharray={y === baseline ? undefined : '2 7'}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {average > 0 ? (
            <line
              x1={LEFT}
              x2={WIDTH - RIGHT}
              y1={averageY}
              y2={averageY}
              className={styles.averageLine}
              strokeDasharray="6 6"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {variant === 'line' ? (
            <>
              <path d={areaPath} className={styles.lineArea} />
              <path
                d={tracePath}
                className={styles.lineTrace}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}

          {safePoints.map((point, index) => {
            const plottedPoint = plottedPoints[index]
            const isSelected = activeIndex === index
            const isEmphasized = isSelected && hasInteracted
            const select = () => {
              setHasInteracted(true)
              setSelectedIndex(index)
            }
            const previousX = plottedPoints[index - 1]?.x ?? plottedPoint.x - fallbackStep
            const nextX = plottedPoints[index + 1]?.x ?? plottedPoint.x + fallbackStep
            const hitStart = index === 0 ? LEFT : (previousX + plottedPoint.x) / 2
            const hitEnd = index === safePoints.length - 1 ? WIDTH - RIGHT : (plottedPoint.x + nextX) / 2
            return (
              <g
                key={`${point.label}-${index}`}
                role="button"
                tabIndex={isSelected ? 0 : -1}
                aria-pressed={isSelected}
                aria-label={`${point.label}: ${formatValue(point.value, valueType)}`}
                data-chart-index={index}
                onMouseEnter={select}
                onFocus={select}
                onClick={select}
                onKeyDown={(event) => selectWithKeyboard(event, index)}
                className="cursor-pointer outline-none"
              >
                <rect x={hitStart} y={TOP} width={Math.max(hitEnd - hitStart, 1)} height={chartHeight} fill="transparent" />
                {variant === 'bar' ? (
                  <rect
                    x={plottedPoint.x - barWidth / 2}
                    y={plottedPoint.y}
                    width={barWidth}
                    height={Math.max(baseline - plottedPoint.y, 0)}
                    rx={Math.min(1, barWidth / 4)}
                    className={isEmphasized ? styles.barSelected : styles.bar}
                  />
                ) : null}
                {isEmphasized ? (
                  <line
                    x1={plottedPoint.x}
                    x2={plottedPoint.x}
                    y1={TOP}
                    y2={baseline}
                    className={styles.selectedGuide}
                    strokeDasharray="3 5"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
                {variant === 'line' && (point.value > 0 || isSelected) ? (
                  <circle
                    cx={plottedPoint.x}
                    cy={plottedPoint.y}
                    r={isSelected ? 5 : 3}
                    className={styles.selectedPoint}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </g>
            )
          })}
          </svg>
        </div>
        <div className={styles.xAxis} aria-hidden="true">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
        </div>
      </div>

      <dl className={styles.chartFacts}>
        <div><dt>Period total</dt><dd>{formatValue(total, valueType)}</dd></div>
        <div><dt>Daily average</dt><dd>{formatValue(average, valueType)}</dd></div>
        <div><dt>Peak · {factPoints[peakIndex]?.label}</dt><dd>{formatValue(peak, valueType)}</dd></div>
      </dl>

      <ul className="sr-only" aria-label={`${title} data`}>
        {safePoints.map((point, index) => (
          <li key={`${point.label}-data-${index}`}>{point.label}: {formatValue(point.value, valueType)}</li>
        ))}
      </ul>
    </article>
  )
}
