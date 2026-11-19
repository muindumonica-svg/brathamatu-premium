import { Link } from '@tanstack/react-router'
import { Alert, Badge, Card, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui'
import {
  useCurrentUser,
  useDashboard,
  usePlatformOverview,
  useTenantOnboarding,
  useUpdateTenantOnboarding,
} from '../../lib/auth/hooks'
import { useTenantStocktakeJobs } from '../../lib/stocktake/hooks'
import { formatOperatingMode } from '../../lib/formatting'

const guidedSetupSteps = ['business-profile', 'branches', 'locations', 'catalogue', 'stocktake-readiness']

function ChecklistItem({ done, title, detail }: { done: boolean; title: string; detail?: string }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          done ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-500'
        }`}
        aria-hidden
      >
        {done ? '✓' : '•'}
      </span>
      <div>
        <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-700'}`}>{title}</p>
        {detail && <p className="text-xs text-gray-500">{detail}</p>}
      </div>
    </li>
  )
}

export function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser()
  const { data: dashboard } = useDashboard()
  const workspace = dashboard?.workspace ?? 'onboarding'
  const overview = usePlatformOverview(workspace === 'platform')
  const tenant = dashboard?.tenant ?? null
  const setup = useTenantOnboarding(tenant?.id)
  const updateSetup = useUpdateTenantOnboarding(tenant?.id)
  const stocktakeJobs = useTenantStocktakeJobs(tenant?.id, {})
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
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
            <Link
              to="/onboarding"
              className="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Create organisation
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
        <Card title="Complete your setup">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Follow these steps to prepare your business for its first stock-taking request.
              </p>
              <span className="text-sm font-medium text-gray-700">
                {completedSetupSteps} of {guidedSetupSteps.length} steps complete
              </span>
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
                      className="flex h-full w-full items-start gap-3 rounded-lg border border-gray-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        done ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {done ? '✓' : index + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-gray-900">{step.title}</span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {done ? 'Complete · review' : 'Open this setup step'}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {updateSetup.isError && (
              <Alert kind="error">Your setup step could not be opened. Please try again.</Alert>
            )}
          </div>
        </Card>
      )}

      {workspace === 'onboarding' && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card title="Start your stock-taking account">
            <ol className="space-y-3 text-sm text-gray-600">
              <li>1. Create your organisation profile and operating mode.</li>
              <li>2. Add branches, warehouses and stock locations.</li>
              <li>3. Upload your catalogue and confirm it is accurate.</li>
              <li>4. Request a stock take or set up a recurring schedule.</li>
            </ol>
            <div className="mt-5">
              <Link
                to="/onboarding"
                className="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                Create organisation
              </Link>
            </div>
          </Card>
          <Card title="Not a business account?">
            <p className="text-sm text-gray-600">
              Stock-taker onboarding and assignment matching arrive in the workforce phase. Your
              account is ready; BrathaMatu will send assignment offers once the workforce module is
              live.
            </p>
          </Card>
        </div>
      )}

      {workspace === 'platform' && (
        <>
          {overview.isError && (
            <Alert kind="error">Platform overview could not be loaded. Check your platform role.</Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tenants"
              value={overview.data?.tenants.total ?? '—'}
              hint={`${overview.data?.tenants.active ?? 0} active · ${overview.data?.tenants.pending ?? 0} pending`}
            />
            <StatCard label="Registered users" value={overview.data?.users.total ?? '—'} hint={`${overview.data?.users.verified ?? 0} verified`} />
            <StatCard label="Active memberships" value={overview.data?.memberships.active ?? '—'} />
            <StatCard label="Audit events (7 days)" value={overview.data?.audit_events_7d ?? '—'} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Tenant management">
              <p className="text-sm text-gray-600">
                Review organisations, operating modes and member access across the marketplace.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/platform/tenants" className="text-sm font-medium text-brand-700 hover:underline">
                  Open tenant directory →
                </Link>
                <Link to="/platform/stocktaking-jobs" className="text-sm font-medium text-brand-700 hover:underline">
                  Review stock-taking jobs →
                </Link>
                <Link to="/platform/catalogue-pricing" className="text-sm font-medium text-brand-700 hover:underline">
                  Catalogue pricing →
                </Link>
                <Link to="/platform/audit" className="text-sm font-medium text-brand-700 hover:underline">
                  View audit trail →
                </Link>
              </div>
            </Card>
            <Card title="Coming online next">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Balance payments and ledger reconciliation — Phase 7</li>
                <li>Workforce verification and assignment — Phase 8</li>
                <li>Field execution and quality review — Phase 9</li>
              </ul>
            </Card>
          </div>
        </>
      )}

      {workspace === 'tenant' && tenant && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Team members" value={dashboard?.stats.tenant_members ?? '—'} />
            <StatCard
              label="Catalogue products"
              value={dashboard?.stats.catalogue_products ?? '—'}
              hint={`${dashboard?.stats.branches ?? 0} branches configured`}
            />
            <StatCard label="Pending invitations" value={dashboard?.stats.pending_invitations ?? 0} />
            <StatCard
              label="Operating mode"
              value={<span className="text-base">{formatOperatingMode(tenant.operating_mode)}</span>}
              hint={tenant.status === 'active' ? 'Tenant approved' : tenant.status}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card
              title="Stock-taking readiness"
              actions={<Badge tone={dashboard?.onboarding.email_verified ? 'green' : 'amber'}>
                {dashboard?.onboarding.email_verified ? 'Account verified' : 'Verification needed'}
              </Badge>}
            >
              <ul className="space-y-3">
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
            </Card>

            <div className="space-y-4">
              <Card title="Quick actions">
                <div className="flex flex-col gap-2 text-sm">
                  <Link to="/business/onboarding" className="font-medium text-brand-700 hover:underline">
                    Continue business setup →
                  </Link>
                  <Link to="/business/catalogue" className="font-medium text-brand-700 hover:underline">
                    Manage catalogue →
                  </Link>
                  <Link to="/business/inventory" className="font-medium text-brand-700 hover:underline">
                    Manage inventory →
                  </Link>
                  <Link to="/business/stocktaking" className="font-medium text-brand-700 hover:underline">
                    Stock-taking requests →
                  </Link>
                  <Link to="/business/team" className="font-medium text-brand-700 hover:underline">
                    Manage team members →
                  </Link>
                  <Link to="/settings" className="font-medium text-brand-700 hover:underline">
                    Organisation settings →
                  </Link>
                  <Link to="/support" className="font-medium text-brand-700 hover:underline">
                    Contact support →
                  </Link>
                </div>
              </Card>
              <Card title="Your role here">
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
              </Card>
            </div>
          </div>
        </>
      )}

      {workspace === 'workforce' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Your workforce profile">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Roles</dt>
                <dd className="font-medium text-gray-900">
                  {dashboard?.worker_roles.map((role) => role.replaceAll('-', ' ')).join(', ') || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email verification</dt>
                <dd>
                  <Badge tone={dashboard?.onboarding.email_verified ? 'green' : 'amber'}>
                    {dashboard?.onboarding.email_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </dd>
              </div>
            </dl>
            <Link to="/workforce/profile" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
              Complete workforce profile →
            </Link>
          </Card>
          <Card title="Assignments and earnings">
            <p className="text-sm text-gray-600">
              Assignment offers and earnings appear after your workforce profile is verified and required training is complete.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {user.permissions.includes('assignment.view') ? (
                <Link to="/workforce/assignments" className="font-medium text-brand-700 hover:underline">
                  View assignment offers →
                </Link>
              ) : null}
              {user.permissions.includes('earnings.view') ? (
                <Link to="/workforce/earnings" className="font-medium text-brand-700 hover:underline">
                  View earnings →
                </Link>
              ) : null}
              {!user.permissions.includes('assignment.view') && (
                <p className="text-gray-500">Assignment access is enabled after profile verification and training.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      <Card title="Platform status">
        <p className="text-sm text-gray-600">
          API and database connectivity are verified by the health endpoint. Operational modules are
          being delivered phase by phase against the master implementation specification.
        </p>
      </Card>
    </div>
  )
}
