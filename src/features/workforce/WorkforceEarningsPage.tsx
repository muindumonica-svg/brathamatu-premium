import { Link } from '@tanstack/react-router'
import { Alert, Card, PageHeader, PageLoader, StatCard, Table } from '../../components/ui'
import { formatDateTime, formatMoney, formatStatusLabel } from '../../lib/formatting'
import { useCurrentUser } from '../../lib/auth/hooks'
import { useWorkforceEarnings } from '../../lib/workforce/hooks'

export function WorkforceEarningsPage() {
  const user = useCurrentUser()
  const canViewEarnings = user.data?.permissions.includes('earnings.view') ?? false
  const { data, isLoading, isError } = useWorkforceEarnings(canViewEarnings)

  if (user.isLoading || (canViewEarnings && isLoading)) return <PageLoader label="Loading your earnings…" />

  if (!canViewEarnings) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader title="Earnings" description="Your assignment compensation." />
        <Alert kind="info">
          Earnings become available after you are eligible for workforce assignments.
        </Alert>
        <Link to="/workforce/profile" className="text-sm font-medium text-brand-700 hover:underline">
          Review my workforce profile →
        </Link>
      </div>
    )
  }

  const totals = data?.totals ?? {}
  const rows = data?.data ?? []
  const currency = data?.currency ?? 'KES'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Earnings"
        description="Your assignment compensation. Only your own disclosed earnings are shown."
      />

      {isError && <Alert kind="error">Earnings could not be loaded.</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Accrued" value={formatMoney(totals.accrued ?? 0, currency)} hint="Accepted, not yet payable" />
        <StatCard label="Payable" value={formatMoney(totals.payable ?? 0, currency)} hint="Approved for payout" />
        <StatCard label="Paid" value={formatMoney(totals.paid ?? 0, currency)} hint="Settled to you" />
      </div>

      <Card title="Earning entries">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">No earnings yet. Accept an assignment to accrue your first fee.</p>
        ) : (
          <Table headers={['Reference', 'Job', 'Earned', 'Amount', 'Status']}>
            {rows.map((earning) => (
              <tr key={earning.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{earning.reference}</td>
                <td className="px-4 py-3 text-gray-600">
                  {earning.job ? (
                    <>
                      <p>{earning.job.reference}</p>
                      <p className="text-xs text-gray-500">{earning.job.title}</p>
                    </>
                  ) : (
                    earning.description ?? '—'
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {earning.earned_at ? formatDateTime(earning.earned_at) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-900">{formatMoney(earning.amount, earning.currency)}</td>
                <td className="px-4 py-3 text-gray-600">{formatStatusLabel(earning.status)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
