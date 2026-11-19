import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  Building2,
  ClipboardList,
  FileSearch,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Tags,
  UserCheck,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react'
import { DonutLegend, GlowDonut } from '../../components/charts'
import { Alert, StatCard } from '../../components/ui'
import { fetchPlatformAnalytics } from '../../lib/api/reporting'
import { fetchPlatformJobs } from '../../lib/api/stocktake'
import { useCurrentUser, usePlatformOverview } from '../../lib/auth/hooks'
import { AnalyticsSection, JobStatusPanel, Panel, PanelLink, QuickActions, RecentJobsTable, type QuickAction } from './widgets'

/**
 * Platform workspace dashboard. Sections appear according to the signed-in
 * person's permissions, so operations, finance, support and super-admin staff
 * each see the parts of the platform they are responsible for.
 */
export function PlatformDashboard() {
  const { data: user } = useCurrentUser()
  const permissions = new Set(user?.permissions ?? [])
  const can = (permission: string) => permissions.has(permission)
  const overview = usePlatformOverview()
  const canSeeJobs = can('stocktake.job.review') || can('finance.payment.record') || can('stocktake.quote.view')
  const canSeeReports = can('report.view')

  const jobs = useQuery({
    queryKey: ['platform', 'stocktake-jobs', 'list', {}],
    queryFn: () => fetchPlatformJobs({}),
    enabled: canSeeJobs,
    retry: false,
  })
  const analytics = useQuery({
    queryKey: ['platform', 'analytics'],
    queryFn: fetchPlatformAnalytics,
    enabled: canSeeReports,
    retry: false,
  })

  const data = overview.data
  const tenantSlices = data
    ? [
        { label: 'Active', value: data.tenants.active },
        { label: 'Pending', value: data.tenants.pending },
        { label: 'Suspended', value: data.tenants.suspended },
      ].filter((slice) => slice.value > 0)
    : []
  const verifiedShare = data && data.users.total > 0 ? Math.round((data.users.verified / data.users.total) * 100) : null

  const actions = ([
    can('tenant.view') && { to: '/platform/tenants', label: 'Tenant directory', description: 'Organisations, modes and access', icon: <Building2 /> },
    canSeeJobs && { to: '/platform/stocktaking-jobs', label: 'Stock-taking jobs', description: 'Review, quote and verify deposits', icon: <ClipboardList /> },
    (can('stocktake.job.monitor') || can('stocktake.job.assign')) && { to: '/platform/operations', label: 'Field operations', description: 'Assignments and job progress', icon: <Workflow /> },
    (can('finance.ledger.view') || can('finance.payment.record')) && { to: '/platform/finance', label: 'Finance', description: 'Collections, ledger and payouts', icon: <Wallet /> },
    can('support.view') && { to: '/platform/support', label: 'Support queue', description: 'Open tickets and escalations', icon: <LifeBuoy /> },
    can('workforce.view') && { to: '/platform/workforce', label: 'Workforce', description: 'Stock taker verification', icon: <UserCheck /> },
    can('pricing.manage') && { to: '/platform/catalogue-pricing', label: 'Catalogue pricing', description: 'Rates used for estimates', icon: <Tags /> },
    can('audit.view') && { to: '/platform/audit', label: 'Audit trail', description: 'Privileged actions and logins', icon: <FileSearch /> },
    can('cms.view') && { to: '/platform/marketing', label: 'Public website', description: 'Pages, media and leads', icon: <Megaphone /> },
    canSeeReports && { to: '/platform/reports', label: 'Reports & analytics', description: 'Generate and export reports', icon: <BarChart3 /> },
  ] as Array<QuickAction | false>).filter((item): item is QuickAction => Boolean(item))

  return (
    <div className="space-y-6">
      {overview.isError && <Alert kind="error">Platform overview could not be loaded. Check your platform role.</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Tenants"
          value={data?.tenants.total.toLocaleString('en-KE') ?? '—'}
          hint={data ? `${data.tenants.active} active · ${data.tenants.pending} pending · ${data.tenants.suspended} suspended` : undefined}
          icon={<Building2 />}
          accent
          loading={overview.isLoading}
        />
        <StatCard
          label="Registered users"
          value={data?.users.total.toLocaleString('en-KE') ?? '—'}
          hint={data ? `${data.users.verified} verified` : undefined}
          icon={<Users />}
          loading={overview.isLoading}
        />
        <StatCard
          label="Active memberships"
          value={data?.memberships.active.toLocaleString('en-KE') ?? '—'}
          hint="People with active business access"
          icon={<ShieldCheck />}
          loading={overview.isLoading}
        />
        <StatCard
          label="Audit events (7 days)"
          value={data?.audit_events_7d.toLocaleString('en-KE') ?? '—'}
          hint="Logins and privileged actions"
          icon={<FileSearch />}
          loading={overview.isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Panel
          title="Tenant portfolio"
          description="Organisations by account status"
          actions={can('tenant.view') ? <PanelLink to="/platform/tenants">Directory</PanelLink> : undefined}
        >
          {data ? (
            <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <GlowDonut
                data={tenantSlices}
                centerValue={data.tenants.total.toLocaleString('en-KE')}
                centerLabel="Tenants"
                size={190}
              />
              <div className="space-y-3">
                <DonutLegend data={tenantSlices} />
                {verifiedShare !== null && (
                  <div className="rounded-xl border border-ws-line bg-ws-sunken/50 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-ws-muted">
                      <span>Verified users</span>
                      <span className="font-medium text-ws-text tabular-nums">{verifiedShare}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ws-raised">
                      <div className="h-full rounded-full bg-ws-gold shadow-ws-glow" style={{ width: `${verifiedShare}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="skeleton mx-auto h-44 w-44 rounded-full" />
          )}
        </Panel>

        {canSeeJobs ? (
          <JobStatusPanel
            statusCounts={jobs.data?.statusCounts ?? {}}
            total={jobs.data?.pagination.total ?? 0}
            loading={jobs.isLoading}
            to="/platform/stocktaking-jobs"
          />
        ) : (
          <QuickActions title="Your workspaces" actions={actions} />
        )}
      </div>

      {canSeeJobs && (
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <RecentJobsTable
            jobs={(jobs.data?.jobs ?? []).slice(0, 6)}
            loading={jobs.isLoading}
            viewAllTo="/platform/stocktaking-jobs"
            jobLink={(job) => ({ to: '/platform/stocktaking-jobs/$jobId', params: { jobId: job.id } })}
            showTenant
          />
          <QuickActions title="Your workspaces" actions={actions} dense />
        </div>
      )}

      {canSeeReports && (
        <section aria-labelledby="platform-analytics" className="space-y-4">
          <h2 id="platform-analytics" className="font-display text-lg font-semibold tracking-tight text-ws-text">
            Platform analytics
          </h2>
          <AnalyticsSection query={analytics} reportsTo="/platform/reports" />
        </section>
      )}
    </div>
  )
}
