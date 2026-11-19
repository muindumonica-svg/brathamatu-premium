import { useId, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from '../lib/formatting'

/*
 * Workspace charts. They only ever render values passed in from the API —
 * empty input renders an empty state, never placeholder data.
 */

export function formatMetric(value: number, format?: string): string {
  if (format === 'money') return formatMoney(value)
  if (format === 'percent') return `${value.toLocaleString('en-KE', { maximumFractionDigits: 1 })}%`
  return value.toLocaleString('en-KE')
}

function compactMetric(value: number, format?: string): string {
  const compact = new Intl.NumberFormat('en-KE', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  if (format === 'money') return `KES ${compact}`
  if (format === 'percent') return `${compact}%`
  return compact
}

// Gold ramp used for multi-segment charts.
const GOLD_RAMP = [
  'oklch(0.82 0.14 76)',
  'oklch(0.72 0.15 62)',
  'oklch(0.9 0.09 88)',
  'oklch(0.6 0.12 55)',
  'oklch(0.78 0.06 80)',
  'oklch(0.5 0.08 60)',
]

export function chartColor(index: number) {
  return GOLD_RAMP[index % GOLD_RAMP.length]
}

export function ChartEmpty({ children = 'No data yet' }: { children?: ReactNode }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-ws-line-strong text-sm text-ws-faint">
      {children}
    </div>
  )
}

function TooltipBox({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean
  payload?: Array<{ value?: number; name?: string; color?: string }>
  label?: string
  format?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-ws-line-strong bg-ws-raised/95 px-3 py-2 text-xs shadow-ws-pop backdrop-blur">
      {label && <p className="mb-1 text-ws-muted">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} className="font-semibold text-ws-text tabular-nums">
          {formatMetric(Number(item.value ?? 0), format)}
        </p>
      ))}
    </div>
  )
}

export type DonutSlice = { label: string; value: number }

/** Glowing donut with a centred headline value. */
export function GlowDonut({
  data,
  centerValue,
  centerLabel,
  format,
  size = 200,
}: {
  data: DonutSlice[]
  centerValue?: ReactNode
  centerLabel?: string
  format?: string
  size?: number
}) {
  const id = useId().replace(/:/g, '')
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (!data.length || total <= 0) return <ChartEmpty />

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <span aria-hidden className="absolute inset-[18%] rounded-full bg-ws-gold/25 blur-2xl" />
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="96%"
            paddingAngle={data.length > 1 ? 3 : 0}
            cornerRadius={6}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive
            style={{ filter: `url(#glow-${id})` }}
          >
            {data.map((item, index) => (
              <Cell key={item.label} fill={chartColor(index)} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-xl border border-ws-line-strong bg-ws-raised/95 px-3 py-2 text-xs shadow-ws-pop">
                  <p className="text-ws-muted">{String(payload[0]?.name ?? '')}</p>
                  <p className="font-semibold text-ws-text tabular-nums">
                    {formatMetric(Number(payload[0]?.value ?? 0), format)}
                  </p>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-semibold tracking-tight text-ws-text tabular-nums">
          {centerValue ?? formatMetric(total, format)}
        </span>
        {centerLabel && <span className="mt-0.5 text-[11px] text-ws-muted">{centerLabel}</span>}
      </div>
    </div>
  )
}

export function DonutLegend({ data, format }: { data: DonutSlice[]; format?: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ws-line bg-ws-line [&>li:last-child:nth-child(odd)]:col-span-2">
      {data.map((item, index) => (
        <li key={item.label} className="bg-ws-surface px-4 py-3">
          <p className="flex items-start gap-2 text-xs text-ws-muted">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: chartColor(index) }} aria-hidden />
            <span className="leading-tight">{item.label}</span>
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-ws-text tabular-nums">
            {formatMetric(item.value, format)}
          </p>
          {total > 0 && (
            <p className="text-[11px] text-ws-faint">{Math.round((item.value / total) * 100)}% of total</p>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Smooth gold area chart for a dated series. */
export function TrendArea({
  points,
  format,
  height = 260,
}: {
  points: Array<{ date: string; value: number }>
  format?: string
  height?: number
}) {
  const id = useId().replace(/:/g, '')
  if (!points.length) return <ChartEmpty>No history for this period yet</ChartEmpty>
  const data = points.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric' }).format(new Date(point.date)),
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.14 76)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.82 0.14 76)" stopOpacity={0} />
            </linearGradient>
            <filter id={`line-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke="oklch(1 0 0 / 0.06)" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'oklch(0.6 0.008 286)', fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: 'oklch(0.6 0.008 286)', fontSize: 11 }}
            tickFormatter={(value: number) => compactMetric(value, format)}
          />
          <Tooltip
            cursor={{ stroke: 'oklch(0.82 0.14 76 / 0.4)', strokeDasharray: '3 3' }}
            content={(props) => (
              <TooltipBox
                active={props.active}
                payload={props.payload as Array<{ value?: number }>}
                label={String(props.label ?? '')}
                format={format}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="oklch(0.84 0.13 78)"
            strokeWidth={2.25}
            fill={`url(#fill-${id})`}
            style={{ filter: `url(#line-glow-${id})` }}
            activeDot={{ r: 5, fill: 'oklch(0.82 0.14 76)', stroke: 'oklch(0.145 0.004 286)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Horizontal ranked bars for a label/value breakdown. */
export function RankedBars({ items, format }: { items: DonutSlice[]; format?: string }) {
  if (!items.length) return <ChartEmpty />
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ws-muted">{item.label}</span>
            <span className="font-medium text-ws-text tabular-nums">{formatMetric(item.value, format)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ws-raised">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, (item.value / max) * 100)}%`,
                background: chartColor(index),
                boxShadow: '0 0 12px oklch(0.82 0.14 76 / 0.5)',
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
