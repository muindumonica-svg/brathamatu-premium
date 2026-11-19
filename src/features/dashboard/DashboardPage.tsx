import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Briefcase,
  CalendarClock,
  Check,
  ClipboardCheck,
  Coins,
  LifeBuoy,
  MailPlus,
  Package,
  Settings,
  Store,
  Tags,
  User,
  Users,
} from 'lucide-react'
import { Alert, Badge, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui'
import {
  useCurrentUser,
  useDashboard,
  useTenantOnboarding,
  useUpdateTenantOnboarding,
} from '../../lib/auth/hooks'
import { useAnalytics } from '../../lib/reporting/hooks'
import { useTenantStocktakeJobs } from '../../lib/stocktake/hooks'
import { useWorkforceAssignments } from '../../lib/workforce/hooks'
import { formatDate, formatOperatingMode, formatStatusLabel } from '../../lib/formatting'
import { StatusBadge } from '../stocktake/shared'
import { PlatformDashboard } from './PlatformDashboard'
import { AnalyticsSection, JobStatusPanel, Panel, PanelLink, QuickActions, RecentJobsTable, type QuickAction } from './widgets'

const guidedSetupSteps = ['business-profile', 'branches', 'locations', 'catalogue', 'stocktake-readiness']

function ChecklistItem({ done, title, detail }: { done: boolean; title: string; detail?: string }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
          done ? 'border-ws-gold/40 bg-ws-gold-soft text-ws-gold' : 'border-ws-line-strong bg-ws-raised text-ws-faint'
        }`}
        aria-hidden
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : '•'}
      </span>
      <div>
        <p className={`text-sm font-medium ${done ? 'text-ws-text' : 'text-ws-muted'}`}>{title}</p>
        {detail && <p className="text-xs text-ws-faint">{detail}</p>}
      </div>
    </li>
  )
}

const primaryLink =
  'inline-flex items-center rounded-full bg-ws-gold px-4 py-2 text-sm font-medium text-ws-gold-ink shadow-[inset_0_1px_0_oklch(1_0_0/0.35)] hover:brightness-105'

export function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser()
  const { data: dashboard } = useDashboard()
  const workspace = dashboard?.workspace ?? 'onboarding'
  const tenant = dashboard?.tenant ?? null
  const permissions = new Set(user?.permissions ?? [])
  const can = (permission: string) => permissions.has(permission)
  const setup = useTenantOnboarding(tenant?.id)
  const updateSetup = useUpdateTenantOnboarding(tenant?.id)
  const stocktakeJobs = useTenantStocktakeJobs(tenant?.id, {})
  const analytics = useAnalytics(workspace === 'tenant' && can('report.view') ? tenant?.id : null)
  const assignments = useWorkforceAssignments(workspace === 'workforce' && can('assignment.view'))
  const jobCount = stocktakeJobs.data?.pagination.total ?? 0
  const setupSteps = setup.data
    ? guidedSetupSteps.flatMap((id) => setup.data.steps.filter((item) => item.id === id))
    : []
  const completedSetupSteps = setupSteps.filter((step) => step.status === 'completed').length

  function openSetupStep(step: (typeof setupSteps)[number]) {
    updateSetup.mutate(
      { step: step.id, action: 'continue' },
      {
        onSuccess: () => window.location.assign(step.href),
      },
    )
  }

  if (isLoading) return <PageLoader label="Loading your workspace…" />
  if (!user) return null

  const tenantActions: QuickAction[] = [
    { to: '/business/onboarding', label: 'Business setup', description: 'Profile, branches and readiness', icon: <Settings /> },
    { to: '/business/catalogue', label: 'Catalogue', description: 'Products, units and barcodes', icon: <Tags /> },
    { to: '/business/inventory', label: 'Inventory', description: 'Stock levels and movements', icon: <Package /> },
    { to: '/business/stocktaking', label: 'Stock-taking requests', description: 'Quotes, deposits and results', icon: <ClipboardCheck /> },
    { to: '/business/team', label: 'Team members', description: 'Invite and manage access', icon: <Users /> },
    { to: '/business/schedules', label: 'Schedules', description: 'Recurring stock-takes', icon: <CalendarClock /> },
    { to: '/settings', label: 'Organisation settings', description: 'Operating mode and details', icon: <Store /> },
    { to: '/support', label: 'Contact support', description: 'Raise and track requests', icon: <LifeBuoy /> },
  ]

  const assignmentList = assignments.data ?? []
  const offered = assignmentList.filter((item) => item.status === 'offered').length
  const accepted = assignmentList.filter((item) => item.status === 'accepted').length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          workspace === 'platform'
            ? 'BrathaMatu operations'
            : workspace === 'tenant'
              ? (tenant?.name ?? 'Your business')
              : workspace === 'workforce'
                ? 'Workforce'
                : 'Getting started'
        }
        title={`Welcome, ${user.name.split(' ')[0]}`}
        description={
          workspace === 'platform'
            ? 'BrathaMatu platform operations — tenant pipeline, audits and marketplace oversight.'
            : workspace === 'tenant'
              ? `${tenant?.name ?? 'Your business'} — stock-taking readiness and team overview.`
              : workspace === 'workforce'
                ? 'Your stock-taking workforce workspace.'
                : 'Finish setting up your organisation to commission stock-taking work.'
        }
        actions={
          workspace === 'onboarding' ? (
            <Link to="/onboarding" className={primaryLink}>
              Create organisation
            </Link>
          ) : workspace === 'tenant' ? (
            <Link to="/business/stocktaking/new" className={primaryLink}>
              New stock-take request
            </Link>
          ) : undefined
        }
      />

      {!dashboard?.onboarding.email_verified && (
        <Alert kind="info">
          Your email is not verified yet.{' '}
          <Link to="/verify" className="font-medium underline">
            Verify it now
          </Link>{' '}
          to unlock payment and job approval flows in later phases.
        </Alert>
      )}

      {workspace === 'tenant' && tenant && setup.isError && (
        <Alert kind="error">Your setup guide could not be loaded. Refresh the page to try again.</Alert>
      )}

      {workspace === 'tenant' && tenant && setup.data && !setup.data.finished_at && (
        <Panel
          title="Complete your setup"
          description="Follow these steps to prepare your business for its first stock-taking request."
          actions={
            <span className="rounded-full border border-ws-gold/30 bg-ws-gold-soft px-3 py-1 text-xs font-medium text-ws-gold">
              {completedSetupSteps} of {guidedSetupSteps.length} steps complete
            </span>
          }
        >
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ws-raised">
            <div
              className="h-full rounded-full bg-ws-gold shadow-ws-glow transition-all"
              style={{ width: `${(completedSetupSteps / guidedSetupSteps.length) * 100}%` }}
            />
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {setupSteps.map((step, index) => {
              const done = step.status === 'completed'
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={updateSetup.isPending}
                    onClick={() => openSetupStep(step)}
                    className="flex h-full w-full items-start gap-3 rounded-xl border border-ws-line bg-ws-sunken/50 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-ws-gold/30 hover:bg-ws-raised disabled:opacity-60"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        done ? 'bg-ws-gold text-ws-gold-ink' : 'border border-ws-line-strong bg-ws-raised text-ws-muted'
                      }`}
                    >
                      {done ? '✓' : index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ws-text">{step.title}</span>
                      <span className="mt-1 block text-xs text-ws-faint">{done ? 'Complete · review' : 'Open this setup step'}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          {updateSetup.isError && (
            <div className="mt-4">
              <Alert kind="error">Your setup step could not be opened. Please try again.</Alert>
            </div>
          )}
        </Panel>
      )}

      {workspace === 'onboarding' && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Panel title="Start your stock-taking account" description="Four steps to your first verified count">
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                'Create your organisation profile and operating mode.',
                'Add branches, warehouses and stock locations.',
                'Upload your catalogue and confirm it is accurate.',
                'Request a stock take or set up a recurring schedule.',
              ].map((text, index) => (
                <li key={text} className="flex gap-3 rounded-xl border border-ws-line bg-ws-sunken/50 p-3 text-sm text-ws-muted">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ws-gold-soft text-xs font-semibold text-ws-gold">
                    {index + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <Link to="/onboarding" className={primaryLink}>
                Create organisation
              </Link>
            </div>
          </Panel>
          <Panel title="Not a business account?">
            <p className="text-sm text-ws-muted">
              Stock takers apply through the workforce programme. Once your profile is verified, BrathaMatu sends
              assignment offers to your workspace.
            </p>
            <div className="mt-4">
              <PanelLink to="/workforce/profile">Open workforce profile</PanelLink>
            </div>
          </Panel>
        </div>
      )}

      {workspace === 'platform' && <PlatformDashboard />}

      {workspace === 'tenant' && tenant && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Stock-taking jobs"
              value={stocktakeJobs.isLoading ? '—' : jobCount.toLocaleString('en-KE')}
              hint={stocktakeJobs.data ? `${stocktakeJobs.data.buckets.awaiting_deposit} awaiting deposit` : undefined}
              icon={<ClipboardCheck />}
              accent
              loading={stocktakeJobs.isLoading}
            />
            <StatCard
              label="Catalogue products"
              value={dashboard?.stats.catalogue_products.toLocaleString('en-KE') ?? '—'}
              hint={`${dashboard?.stats.branches ?? 0} branches configured`}
              icon={<Tags />}
            />
            <StatCard
              label="Team members"
              value={dashboard?.stats.tenant_members.toLocaleString('en-KE') ?? '—'}
              hint={`${dashboard?.stats.pending_invitations ?? 0} pending invitations`}
              icon={<Users />}
            />
            <StatCard
              label="Operating mode"
              value={<span className="text-lg">{formatOperatingMode(tenant.operating_mode)}</span>}
              hint={tenant.status === 'active' ? 'Tenant approved' : formatStatusLabel(tenant.status)}
              icon={<Store />}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            <JobStatusPanel
              statusCounts={stocktakeJobs.data?.statusCounts ?? {}}
              total={jobCount}
              loading={stocktakeJobs.isLoading}
              to="/business/stocktaking"
            />
            <RecentJobsTable
              jobs={(stocktakeJobs.data?.jobs ?? []).slice(0, 5)}
              loading={stocktakeJobs.isLoading}
              viewAllTo="/business/stocktaking"
              jobLink={(job) => ({ to: '/business/stocktaking/$jobId', params: { jobId: job.id } })}
            />
          </div>

          {can('report.view') && (
            <section aria-labelledby="business-analytics" className="space-y-4">
              <h2 id="business-analytics" className="font-display text-lg font-semibold tracking-tight text-ws-text">
                Business analytics
              </h2>
              <AnalyticsSection query={analytics} reportsTo="/business/reports" />
            </section>
          )}

          <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
            <Panel
              title="Stock-taking readiness"
              actions={
                <Badge tone={dashboard?.onboarding.email_verified ? 'green' : 'amber'}>
                  {dashboard?.onboarding.email_verified ? 'Account verified' : 'Verification needed'}
                </Badge>
              }
            >
              <ul className="space-y-4">
                <ChecklistItem done title="Organisation created" detail={`${tenant.name} · ${tenant.status}`} />
                <ChecklistItem done={dashboard?.onboarding.email_verified ?? false} title="Email verified" />
                <ChecklistItem
                  done={(dashboard?.stats.branches ?? 0) > 0}
                  title="Branches and locations"
                  detail={
                    (dashboard?.stats.branches ?? 0) > 0
                      ? `${dashboard?.stats.branches} branches configured`
                      : 'Add at least one counting site'
                  }
                />
                <ChecklistItem
                  done={dashboard?.onboarding.catalogue_ready ?? false}
                  title="Catalogue products"
                  detail={
                    dashboard?.onboarding.catalogue_ready
                      ? `${dashboard?.stats.catalogue_products ?? 0} active products available`
                      : 'Add or import active products; declarations are request-specific'
                  }
                />
                <ChecklistItem
                  done={jobCount > 0}
                  title="First stock-taking request"
                  detail={
                    jobCount > 0
                      ? `${jobCount} request${jobCount === 1 ? '' : 's'} created — track quotes and deposits`
                      : 'Create a request to receive a provisional estimate and deposit'
                  }
                />
              </ul>
              <div className="mt-5 border-t border-ws-line pt-4">
                <p className="mb-2 text-xs text-ws-faint">Your role here</p>
                {dashboard?.tenant_roles.length ? (
                  <div className="flex flex-wrap gap-2">
                    {dashboard.tenant_roles.map((role) => (
                      <Badge key={role} tone="green">
                        {role.replaceAll('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tenant role assigned" description="Ask a business owner to assign your access." />
                )}
              </div>
            </Panel>
            <QuickActions actions={can('report.view') ? [...tenantActions.slice(0, 7), { to: '/business/reports', label: 'Reports & analytics', description: 'Generate and export reports', icon: <BarChart3 /> }] : tenantActions} />
          </div>
        </>
      )}

      {workspace === 'workforce' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Assignment offers"
              value={can('assignment.view') ? offered : '—'}
              hint={can('assignment.view') ? 'Waiting for your response' : 'Available after verification'}
              icon={<MailPlus />}
              accent
              loading={assignments.isLoading}
            />
            <StatCard
              label="Accepted assignments"
              value={can('assignment.view') ? accepted : '—'}
              hint="Jobs you have committed to"
              icon={<Briefcase />}
              loading={assignments.isLoading}
            />
            <StatCard
              label="Workforce roles"
              value={<span className="text-lg capitalize">{dashboard?.worker_roles.map((role) => role.replaceAll('-', ' ')).join(', ') || '—'}</span>}
              icon={<User />}
            />
            <StatCard
              label="Email verification"
              value={<span className="text-lg">{dashboard?.onboarding.email_verified ? 'Verified' : 'Pending'}</span>}
              icon={<Check />}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Panel
              title="My assignments"
              description="Offers and accepted stock-taking jobs"
              actions={can('assignment.view') ? <PanelLink to="/workforce/assignments">View all</PanelLink> : undefined}
            >
              {!can('assignment.view') ? (
                <EmptyState
                  title="Assignments unlock after verification"
                  description="Assignment offers and earnings appear after your workforce profile is verified and required training is complete."
                />
              ) : assignmentList.length === 0 ? (
                <EmptyState title="No assignments yet" description="New offers will appear here." />
              ) : (
                <ul className="divide-y divide-ws-line">
                  {assignmentList.slice(0, 6).map((assignment) => (
                    <li key={assignment.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ws-text">{assignment.job?.title ?? 'Stock-taking job'}</p>
                        <p className="truncate text-xs text-ws-faint">
                          {[assignment.job?.reference, assignment.job?.tenant, assignment.job?.deadline_at ? `Due ${formatDate(assignment.job.deadline_at)}` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <StatusBadge status={assignment.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <QuickActions
              title="Shortcuts"
              actions={[
                { to: '/workforce/profile', label: 'Workforce profile', description: 'Skills, areas and availability', icon: <User /> },
                ...(can('assignment.view')
                  ? [{ to: '/workforce/assignments', label: 'Assignment offers', description: 'Accept or decline jobs', icon: <Briefcase /> }]
                  : []),
                ...(can('earnings.view')
                  ? [{ to: '/workforce/earnings', label: 'Earnings', description: 'Payouts and statements', icon: <Coins /> }]
                  : []),
                { to: '/support', label: 'Support', description: 'Get help with a job', icon: <LifeBuoy /> },
              ]}
            />
          </div>
        </>
      )}
    </div>
  )
}
