'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'

import styles from './AdminDashboard.module.css'

const CHART_WIDTH = 920
const CHART_HEIGHT = 330
const CHART_LEFT = 68
const CHART_RIGHT = 24
const CHART_TOP = 28
const CHART_BOTTOM = 42

type ChartMetric = 'revenue' | 'orders' | 'aov'
type DashboardRange = 7 | 14 | 30

export interface DashboardRangeOption {
  value: DashboardRange
  label: string
}

interface ActivityPoint {
  date: string
  label: string
  previousLabel: string
  revenue: number
  previousRevenue: number
  orders: number
  previousOrders: number
  aov: number
  previousAov: number
}

interface OutcomePoint {
  id: string
  label: string
  description: string
  count: number
  color: string
}

interface MetricSummary {
  current: number
  previous: number
}

interface AdminDashboardVisualsProps {
  activity: ActivityPoint[]
  metric: ChartMetric
  range: DashboardRange
  rangeOptions: DashboardRangeOption[]
  currentPeriodLabel: string
  previousPeriodLabel: string
  summaries: Record<ChartMetric, MetricSummary>
  outcomes: OutcomePoint[]
}

const metricLabels: Record<ChartMetric, string> = {
  revenue: 'Revenue',
  orders: 'Orders',
  aov: 'AOV',
}

function formatMetricValue(metric: ChartMetric, value: number) {
  const formatted = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value)
  return metric === 'orders' ? formatted : `Tk ${formatted}`
}

function buildLinearPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return ''
  return points.slice(1).reduce((path, point) => `${path} L ${point.x} ${point.y}`, `M ${points[0].x} ${points[0].y}`)
}

function getNiceMaximum(values: number[]) {
  const maximum = Math.max(...values, 1)
  const magnitude = 10 ** Math.floor(Math.log10(maximum))
  const normalized = maximum / magnitude
  const rounded = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((step) => step >= normalized) ?? 10
  return rounded * magnitude
}

function selectWithKeyboard(event: KeyboardEvent<SVGGElement>, select: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  select()
}

export function DashboardRangeSelector({ value, options }: { value: DashboardRange; options: DashboardRangeOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectRange = (nextValue: string) => {
    const query = new URLSearchParams(searchParams.toString())
    query.set('range', nextValue)
    query.delete('chartRange')
    query.delete('outcomeRange')
    router.push(`/admin/dashboard?${query.toString()}`)
  }

  return (
    <label className={styles.rangeSelector}>
      <span className="sr-only">Dashboard reporting period</span>
      <select value={value} onChange={(event) => selectRange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" />
    </label>
  )
}

export function AdminDashboardVisuals({
  activity,
  metric,
  range,
  rangeOptions,
  currentPeriodLabel,
  previousPeriodLabel,
  summaries,
  outcomes,
}: AdminDashboardVisualsProps) {
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(() => {
    if (!activity.length) return 0
    return activity.reduce((selected, point, index, points) => (
      point[metric] > points[selected][metric] ? index : selected
    ), 0)
  })
  const [selectedOutcomeId, setSelectedOutcomeId] = useState(
    outcomes.find((outcome) => outcome.id === 'completed')?.id ?? outcomes[0]?.id ?? '',
  )
  const safeActivity = activity.length ? activity : [{
    date: 'empty',
    label: 'No activity',
    previousLabel: 'No activity',
    revenue: 0,
    previousRevenue: 0,
    orders: 0,
    previousOrders: 0,
    aov: 0,
    previousAov: 0,
  }]
  const previousMetric = `previous${metric[0].toUpperCase()}${metric.slice(1)}` as 'previousRevenue' | 'previousOrders' | 'previousAov'
  const currentValues = safeActivity.map((point) => point[metric])
  const previousValues = safeActivity.map((point) => point[previousMetric])
  const maximum = getNiceMaximum([...currentValues, ...previousValues])
  const chartWidth = CHART_WIDTH - CHART_LEFT - CHART_RIGHT
  const chartHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM
  const baseline = CHART_HEIGHT - CHART_BOTTOM
  const step = chartWidth / Math.max(safeActivity.length - 1, 1)
  const selectedIndex = Math.min(selectedActivityIndex, safeActivity.length - 1)
  const selectedActivity = safeActivity[selectedIndex]
  const currentPoints = safeActivity.map((point, index) => ({
    x: safeActivity.length === 1 ? CHART_LEFT + chartWidth / 2 : CHART_LEFT + index * step,
    y: baseline - (point[metric] / maximum) * chartHeight,
  }))
  const previousPoints = safeActivity.map((point, index) => ({
    x: safeActivity.length === 1 ? CHART_LEFT + chartWidth / 2 : CHART_LEFT + index * step,
    y: baseline - (point[previousMetric] / maximum) * chartHeight,
  }))
  const currentPath = buildLinearPath(currentPoints)
  const previousPath = buildLinearPath(previousPoints)
  const selectedPoint = currentPoints[selectedIndex]
  const tooltipWidth = 128
  const tooltipX = Math.min(Math.max(selectedPoint.x - tooltipWidth / 2, CHART_LEFT), CHART_WIDTH - CHART_RIGHT - tooltipWidth)
  const tooltipY = Math.max(CHART_TOP, selectedPoint.y - 70)
  const summary = summaries[metric]
  const difference = summary.current - summary.previous
  const differenceDirection = difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat'

  const totalOutcomes = outcomes.reduce((sum, outcome) => sum + outcome.count, 0)
  const selectedOutcome = outcomes.find((outcome) => outcome.id === selectedOutcomeId) ?? outcomes[0]
  const selectedOutcomeShare = totalOutcomes
    ? Math.round(((selectedOutcome?.count ?? 0) / totalOutcomes) * 100)
    : 0

  return (
    <div className={styles.performanceGrid}>
      <section className={styles.panel} aria-labelledby="revenue-performance-heading">
        <div className={styles.performanceHeader}>
          <div>
            <h2 id="revenue-performance-heading">Revenue Performance</h2>
            <nav className={styles.metricTabs} aria-label="Performance metric">
              {(Object.keys(metricLabels) as ChartMetric[]).map((option) => (
                <Link
                  key={option}
                  href={{ pathname: '/admin/dashboard', query: { range, metric: option } }}
                  aria-current={metric === option ? 'page' : undefined}
                >
                  {metricLabels[option]}
                </Link>
              ))}
            </nav>
          </div>
          <DashboardRangeSelector value={range} options={rangeOptions} />
        </div>

        <div className={styles.performanceSummary}>
          <div><span>Total {metricLabels[metric].toLowerCase()}</span><strong>{formatMetricValue(metric, summary.current)}</strong></div>
          <div><span>Previous period</span><strong>{formatMetricValue(metric, summary.previous)}</strong></div>
          <div data-direction={differenceDirection}><span>Difference</span><strong>{formatMetricValue(metric, Math.abs(difference))}</strong></div>
          <div className={styles.chartLegend}>
            <span><i data-line="current" />{currentPeriodLabel}</span>
            <span><i data-line="previous" />{previousPeriodLabel}</span>
          </div>
        </div>

        <div className={styles.chartStage}>
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={styles.chart} role="img" aria-label={`Interactive ${metricLabels[metric]} comparison chart`}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = CHART_TOP + ratio * chartHeight
              return (
                <g key={ratio}>
                  <line x1={CHART_LEFT} x2={CHART_WIDTH - CHART_RIGHT} y1={y} y2={y} className={styles.gridLine} vectorEffect="non-scaling-stroke" />
                  <text x={CHART_LEFT - 12} y={y + 4} textAnchor="end" className={styles.axisText}>
                    {formatMetricValue(metric, maximum * (1 - ratio))}
                  </text>
                </g>
              )
            })}

            <path d={previousPath} className={styles.previousLine} vectorEffect="non-scaling-stroke" />
            <path d={currentPath} className={styles.currentLine} vectorEffect="non-scaling-stroke" />

            {safeActivity.map((point, index) => {
              const plottedPoint = currentPoints[index]
              const hitWidth = Math.max(step, 24)
              const select = () => setSelectedActivityIndex(index)
              return (
                <g
                  key={point.date}
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.label}: ${formatMetricValue(metric, point[metric])}`}
                  onMouseEnter={select}
                  onFocus={select}
                  onClick={select}
                  onKeyDown={(event) => selectWithKeyboard(event, select)}
                  className={styles.chartHitTarget}
                >
                  <rect x={plottedPoint.x - hitWidth / 2} y={CHART_TOP} width={hitWidth} height={chartHeight} fill="transparent" />
                </g>
              )
            })}

            <line x1={selectedPoint.x} x2={selectedPoint.x} y1={selectedPoint.y} y2={baseline} className={styles.selectionGuide} vectorEffect="non-scaling-stroke" />
            <circle cx={selectedPoint.x} cy={selectedPoint.y} r="5" className={styles.selectionPoint} vectorEffect="non-scaling-stroke" />
            <g transform={`translate(${tooltipX} ${tooltipY})`} className={styles.chartTooltip}>
              <rect width={tooltipWidth} height="54" rx="7" />
              <text x="12" y="20">{selectedActivity.label}</text>
              <text x="12" y="41">{formatMetricValue(metric, selectedActivity[metric])}</text>
            </g>
          </svg>
          <div
            className={styles.chartAxisLabels}
            data-chart-inspection={`${selectedActivity.label}: ${formatMetricValue(metric, selectedActivity[metric])}`}
          >
            <span>{safeActivity[0]?.label}</span>
            <span>{safeActivity[Math.floor((safeActivity.length - 1) / 2)]?.label}</span>
            <span>{safeActivity.at(-1)?.label}</span>
          </div>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="order-outcomes-heading">
        <div className={styles.outcomeHeader}>
          <h2 id="order-outcomes-heading">Order outcomes</h2>
          <label className={styles.outcomeSelector} style={{ '--outcome-color': selectedOutcome?.color } as CSSProperties}>
            <span className="sr-only">Selected order outcome</span>
            <i />
            <select value={selectedOutcomeId} onChange={(event) => setSelectedOutcomeId(event.target.value)}>
              {outcomes.map((outcome) => <option key={outcome.id} value={outcome.id}>{outcome.label}</option>)}
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        </div>

        <div className={styles.outcomeFocus} style={{ '--outcome-color': selectedOutcome?.color } as CSSProperties}>
          <span className={styles.outcomeIcon}><Check aria-hidden="true" /></span>
          <span>
            <strong>{selectedOutcome?.label ?? 'No orders'}</strong>
            <small>{selectedOutcome?.description ?? 'No recorded orders'}</small>
          </span>
          <span className={styles.outcomePercentage} data-outcome-selected="true">
            <strong>{selectedOutcomeShare}%</strong>
            <small>{selectedOutcome?.count ?? 0} of {totalOutcomes} orders</small>
          </span>
        </div>

        <div className={styles.outcomeBar} role="img" aria-label="Order outcome distribution">
          {outcomes.filter((outcome) => outcome.count > 0).map((outcome) => (
            <span
              key={outcome.id}
              style={{ width: `${(outcome.count / Math.max(totalOutcomes, 1)) * 100}%`, backgroundColor: outcome.color }}
              title={`${outcome.label}: ${outcome.count}`}
            />
          ))}
        </div>

        <div className={styles.outcomeList}>
          {outcomes.map((outcome) => {
            const percentage = totalOutcomes ? Math.round((outcome.count / totalOutcomes) * 100) : 0
            return (
              <button
                key={outcome.id}
                type="button"
                className={styles.outcomeRow}
                aria-pressed={outcome.id === selectedOutcomeId}
                onClick={() => setSelectedOutcomeId(outcome.id)}
              >
                <span className={styles.outcomeName}><i style={{ backgroundColor: outcome.color }} /><span>{outcome.label}</span></span>
                <strong>{outcome.count}</strong>
                <span>{percentage}%</span>
              </button>
            )
          })}
          <div className={styles.outcomeTotal}><span>Total orders</span><strong>{totalOutcomes}</strong></div>
        </div>
      </section>
    </div>
  )
}
