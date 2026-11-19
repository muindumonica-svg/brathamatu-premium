import { Link, useParams } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Alert, Badge, Button, Card, EmptyState, Field, PageHeader, PageLoader, Select } from '../../components/ui'
import { ApiError } from '../../lib/api/client'
import { useMembers, usePlatformTenant, useUpdateTenant } from '../../lib/auth/hooks'
import { formatDateTime, formatOperatingMode } from '../../lib/formatting'

export function PlatformTenantDetailPage() {
  const params = useParams({ strict: false }) as { tenantId?: string }
  const tenant = usePlatformTenant(params.tenantId)
  const members = useMembers(params.tenantId)
  const updateTenant = useUpdateTenant(params.tenantId)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [modeError, setModeError] = useState<string | null>(null)
  const [modeSaved, setModeSaved] = useState(false)

  if (tenant.isLoading) return <PageLoader label="Loading tenant…" />
  if (tenant.isError || !tenant.data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <EmptyState title="Tenant not found" description="The organisation may have been removed or the link is invalid." />
        <Link to="/platform/tenants" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to tenants
        </Link>
      </div>
    )
  }

  const data = tenant.data

  function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setProfileError(null)
    setProfileSaved(false)
    updateTenant.mutate(
      {
        name: String(formData.get('name') ?? ''),
        legal_name: String(formData.get('legal_name') ?? '') || null,
        business_type: String(formData.get('business_type') ?? '') || null,
        industry: String(formData.get('industry') ?? '') || null,
        email: String(formData.get('email') ?? '') || null,
        phone: String(formData.get('phone') ?? '') || null,
        address: String(formData.get('address') ?? '') || null,
        timezone: String(formData.get('timezone') ?? ''),
        status: String(formData.get('status') ?? data.status),
      },
      {
        onSuccess: () => setProfileSaved(true),
        onError: (error) => {
          setProfileError(
            error instanceof ApiError
              ? error.message
              : 'Could not save organization changes. Please try again.',
          )
        },
      },
    )
  }

  function upgradeOperatingMode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const mode = formData.get('operating_mode')
    if (mode !== 'external' && mode !== 'brathamatu_pos') return

    setModeError(null)
    setModeSaved(false)
    updateTenant.mutate(
      { operating_mode: mode },
      {
        onSuccess: () => setModeSaved(true),
        onError: (error) => {
          setModeError(
            error instanceof ApiError
              ? error.details.operating_mode?.[0] ?? error.message
              : 'Could not upgrade the operating mode. Please try again.',
          )
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/platform/tenants" className="text-sm font-medium text-brand-700 hover:underline">
          ← Tenants
        </Link>
      </div>
      <PageHeader
        title={data.name}
        description={data.industry ?? 'Industry not supplied'}
        actions={<Badge tone={data.status === 'active' ? 'green' : data.status === 'pending' ? 'amber' : 'red'}>{data.status}</Badge>}
      />

      <Card title="Organization administration">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Update this organization’s profile and account status. Status changes are recorded in the audit trail.
            </p>
            <Link
              to="/platform/tenants/$tenantId/team"
              params={{ tenantId: data.id }}
              className="inline-flex items-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Manage team and roles
            </Link>
          </div>
          {profileError && <Alert kind="error">{profileError}</Alert>}
          {profileSaved && <Alert kind="success">Organization profile and status saved.</Alert>}
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Trading name" name="name" defaultValue={data.name} required />
              <Field label="Legal name" name="legal_name" defaultValue={data.legal_name ?? ''} />
              <Field label="Business type" name="business_type" defaultValue={data.business_type ?? ''} />
              <Field label="Industry" name="industry" defaultValue={data.industry ?? ''} />
              <Field label="Contact email" name="email" type="email" defaultValue={data.email ?? ''} />
              <Field label="Phone" name="phone" defaultValue={data.phone ?? ''} />
              <Field label="Address" name="address" defaultValue={data.address ?? ''} />
              <Field label="Timezone" name="timezone" defaultValue={data.timezone} required />
              <Select label="Organization status" name="status" defaultValue={data.status}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            <Button type="submit" loading={updateTenant.isPending}>
              Save organization
            </Button>
          </form>

          <div className="border-t border-gray-200 pt-5">
            <h3 className="font-semibold text-gray-900">Operating mode</h3>
            <p className="mt-1 text-sm text-gray-600">
              An organization can upgrade from Manual / spreadsheets to External POS / ERP or BrathaMatu POS.
              Upgrades cannot be reversed.
            </p>
            {data.operating_mode === 'manual' ? (
              <form onSubmit={upgradeOperatingMode} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <Select label="Upgrade operating mode" name="operating_mode" defaultValue="brathamatu_pos">
                  <option value="external">External POS or ERP</option>
                  <option value="brathamatu_pos">BrathaMatu POS</option>
                </Select>
                <Button type="submit" loading={updateTenant.isPending}>
                  Upgrade mode
                </Button>
              </form>
            ) : (
              <p className="mt-3 text-sm font-medium text-gray-900">
                {formatOperatingMode(data.operating_mode)} — mode is locked against downgrade.
              </p>
            )}
            {modeError && <Alert kind="error">{modeError}</Alert>}
            {modeSaved && <Alert kind="success">Operating mode upgraded.</Alert>}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Organisation profile">
          <dl className="space-y-3 text-sm">
            {[
              ['Legal name', data.legal_name ?? '—'],
              ['Business type', data.business_type ?? '—'],
              ['Email', data.email ?? '—'],
              ['Phone', data.phone ?? '—'],
              ['Address', data.address ?? '—'],
              ['Timezone', data.timezone],
              ['Operating mode', formatOperatingMode(data.operating_mode)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title={`Team members (${members.data?.length ?? 0})`}>
          {members.isLoading && <PageLoader label="Loading members…" />}
          {members.data?.length === 0 && <EmptyState title="No members" />}
          <ul className="divide-y divide-gray-100">
            {members.data?.map((member) => (
              <li key={member.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {member.joined_at ? formatDateTime(member.joined_at) : '—'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {member.roles.map((role) => (
                    <Badge key={role.slug} tone="green">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
