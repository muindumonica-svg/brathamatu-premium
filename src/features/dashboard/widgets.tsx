import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Lightbulb, TrendingUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ChartEmpty, DonutLegend, GlowDonut, RankedBars, TrendArea, formatMetric } from '../../components/charts'
import { Alert, Skeleton, StatCard } from '../../components/ui'
import type { Analytics } from '../../lib/api/reporting'
import type { StocktakeJobSummary } from '../../lib/api/stocktake'
import { formatDate, formatMoney, formatStatusLabel } from '../../lib/formatting'
import { StatusBadge } from '../stocktake/shared'

/* Dashboard building blocks. Every figure comes from an existing API response. */

export function Panel({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`ws-card flex flex-col ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ws-text">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ws-muted">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  )
}

export function PillSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-full border border-ws-line-strong !bg-ws-raised px-3 pr-7 text-xs text-ws-text outline-none hover:border-ws-gold/40 focus:border-ws-gold/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 rounded-full border border-ws-line-strong px-3 py-1.5 text-xs font-medium text-ws-text transition-colors hover:border-ws-gold/40 hover:text-ws-gold"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  )
}

/* ------------------------------------------------------------------ */

export function AnalyticsSection({
  query,
  reportsTo,
}: {
  query: { data?: Analytics; isLoading: boolean; isError: boolean }
  reportsTo: string
}) {
  const [seriesKey, setSeriesKey] = useState<string | null>(null)
  const [breakdownKey, setBreakdownKey] = useState<string | null>(null)

  if (query.isError) {
    return <Alert kind="info">Analytics are not available for your account right now.</Alert>
  }
  if (query.isLoading || !query.data) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="ws-card space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="ws-card space-y-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mx-auto h-44 w-44 rounded-full" />
        </div>
      </div>
    )
  }

  const data = query.data
  const series = data.series.find((item) => item.key === seriesKey) ?? data.series[0]
  const breakdown = data.breakdowns.find((item) => item.key === breakdownKey) ?? data.breakdowns[0]
  const latest = series?.points[series.points.length - 1]

  return (
    <div className="space-y-4">
      {data.kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {data.kpis.slice(0, 4).map((kpi, index) => (
            <StatCard
              key={kpi.key}
              label={kpi.label}
              value={formatMetric(kpi.value, kpi.format)}
              hint={kpi.hint ?? undefined}
              accent={index === 0}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title={series?.label ?? 'Trends'}
          description={latest ? `Latest: ${formatMetric(latest.value, series?.format)} · ${formatDate(latest.date)}` : 'Activity over time'}
          actions={
            data.series.length > 1 ? (
              <PillSelect
                label="Choose trend"
                value={series?.key ?? ''}
                onChange={setSeriesKey}
                options={data.series.map((item) => ({ value: item.key, label: item.label }))}
              />
            ) : undefined
          }
        >
          {series ? <TrendArea points={series.points} format={series.format} /> : <ChartEmpty />}
        </Panel>

        <Panel
          title={breakdown?.label ?? 'Breakdown'}
          description="Share of total"
          actions={
            data.breakdowns.length > 1 ? (
              <PillSelect
                label="Choose breakdown"
                value={breakdown?.key ?? ''}
                onChange={setBreakdownKey}
                options={data.breakdowns.map((item) => ({ value: item.key, label: item.label }))}
              />
            ) : undefined
          }
        >
          {breakdown && breakdown.items.length > 0 ? (
            breakdown.items.length > 6 ? (
              <RankedBars items={breakdown.items.slice(0, 8)} format={breakdown.format} />
            ) : (
              <div className="space-y-5">
                <GlowDonut data={breakdown.items} format={breakdown.format} centerLabel="Total" size={180} />
                <DonutLegend data={breakdown.items} format={breakdown.format} />
              </div>
            )
          ) : (
            <ChartEmpty />
          )}
        </Panel>
      </div>

      {data.insights.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.insights.slice(0, 3).map((insight) => (
            <div key={insight.key} className="ws-card flex gap-3 p-4">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  insight.severity === 'warning'
                    ? 'bg-ws-warning-soft text-ws-warning'
                    : insight.severity === 'success'
                      ? 'bg-ws-success-soft text-ws-success'
                      : 'bg-ws-info-soft text-ws-info'
                }`}
                aria-hidden
              >
                {insight.severity === 'success' ? <TrendingUp className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ws-text">{insight.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ws-muted">{insight.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <PanelLink to={reportsTo}>Open reports &amp; analytics</PanelLink>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function JobStatusPanel({
  statusCounts,
  total,
  loading,
  to,
}: {
  statusCounts: Record<string, number>
  total: number
  loading: boolean
  to: string
}) {
  const slices = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([status, value]) => ({ label: formatStatusLabel(status), value }))
  const top = slices.slice(0, 5)
  const rest = slices.slice(5).reduce((sum, item) => sum + item.value, 0)
  const data = rest > 0 ? [...top, { label: 'Other', value: rest }] : top

  return (
    <Panel title="Stock-taking pipeline" description="Jobs by current status" actions={<PanelLink to={to}>View all</PanelLink>}>
      {loading ? (
        <Skeleton className="mx-auto h-44 w-44 rounded-full" />
      ) : data.length === 0 ? (
        <ChartEmpty>No stock-taking jobs yet</ChartEmpty>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <GlowDonut data={data} centerValue={total.toLocaleString('en-KE')} centerLabel="Total jobs" size={190} />
          <DonutLegend data={data} />
        </div>
      )}
    </Panel>
  )
}

export function RecentJobsTable({
  jobs,
  loading,
  title = 'Recent stock-taking jobs',
  description = 'Latest requests and their status',
  viewAllTo,
  jobLink,
  showTenant = false,
}: {
  jobs: StocktakeJobSummary[]
  loading: boolean
  title?: string
  description?: string
  viewAllTo: string
  jobLink: (job: StocktakeJobSummary) => { to: string; params: Record<string, string> }
  showTenant?: boolean
}) {
  return (
    <Panel title={title} description={description} actions={<PanelLink to={viewAllTo}>View all</PanelLink>}>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <ChartEmpty>No stock-taking jobs yet</ChartEmpty>
      ) : (
        <div className="ws-scroll -mx-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ws-line text-left text-xs text-ws-muted">
                <th scope="col" className="px-5 pb-3 font-medium">Job</th>
                {showTenant && <th scope="col" className="px-3 pb-3 font-medium">Business</th>}
                <th scope="col" className="px-3 pb-3 font-medium">Deadline</th>
                <th scope="col" className="px-3 pb-3 text-right font-medium">Value</th>
                <th scope="col" className="px-5 pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ws-line">
              {jobs.map((job) => {
                const link = jobLink(job)
                return (
                  <tr key={job.id} className="transition-colors hover:bg-ws-raised/50">
                    <td className="px-5 py-3">
                      <Link to={link.to} params={link.params} className="group flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ws-line-strong bg-ws-raised text-[10px] font-semibold text-ws-gold">
                          {job.reference.slice(-3)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ws-text group-hover:text-ws-gold">{job.title}</span>
                          <span className="block truncate text-xs text-ws-faint">{job.reference} · {job.scope_label}</span>
                        </span>
                      </Link>
                    </td>
                    {showTenant && <td className="whitespace-nowrap px-3 py-3 text-ws-muted">{job.tenant?.name ?? '—'}</td>}
                    <td className="whitespace-nowrap px-3 py-3 text-ws-muted">{job.deadline_at ? formatDate(job.deadline_at) : '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-ws-text tabular-nums">
                      {formatMoney(job.quote_total ?? job.provisional_total, job.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} label={job.status_label} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */

export type QuickAction = { to: string; label: string; description: string; icon: ReactNode }

export function QuickActions({
  title = 'Quick actions',
  actions,
  dense = false,
}: {
  title?: string
  actions: QuickAction[]
  dense?: boolean
}) {
  if (!actions.length) return null
  return (
    <Panel title={title}>
      <div className={`grid gap-2 ${dense ? 'sm:grid-cols-2 xl:grid-cols-1' : 'sm:grid-cols-2'}`}>
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex items-start gap-3 rounded-xl border border-ws-line bg-ws-sunken/50 p-3 transition-all hover:-translate-y-0.5 hover:border-ws-gold/30 hover:bg-ws-raised"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ws-gold-soft text-ws-gold [&_svg]:h-4 [&_svg]:w-4" aria-hidden>
              {action.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ws-text group-hover:text-ws-gold">{action.label}</span>
              <span className="block text-xs text-ws-muted">{action.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  )
}
