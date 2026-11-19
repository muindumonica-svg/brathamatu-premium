import { useState, type FormEvent } from 'react'
import { Alert, Button, Card, Field, PageHeader, PageLoader, Select } from '../../components/ui'
import { ApiError } from '../../lib/api/client'
import { useCurrentUser, useTenants, useUpdateTenant } from '../../lib/auth/hooks'
import type { Tenant } from '../../lib/api/schemas'
import { CollapsibleForm } from '../../components/ui'

export function TenantSettingsPage() {
  const { data: user, isLoading } = useCurrentUser()
  const tenantId = user?.current_tenant?.id
  const tenants = useTenants()
  const tenant = tenants.data?.find((item) => item.id === tenantId)
  const updateTenant = useUpdateTenant(tenantId)
  const [values, setValues] = useState<Partial<Tenant>>({})
  const [selectedMode, setSelectedMode] = useState<'external' | 'brathamatu_pos'>('external')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [modeSaved, setModeSaved] = useState(false)

  if (isLoading || tenants.isLoading) return <PageLoader />
  if (!tenantId) return <Alert kind="error">Select a business before editing settings.</Alert>
  if (!tenant) return <Alert kind="error">Business profile could not be loaded.</Alert>

  const canUpdate = Boolean(user?.permissions.includes('tenant.update'))
  const current = { ...tenant, ...values }
  const operatingModeLocked = tenant.operating_mode !== 'manual'
  const operatingModeLabel = {
    manual: 'Manual / spreadsheets',
    external: 'External POS or ERP',
    brathamatu_pos: 'BrathaMatu POS',
  }[tenant.operating_mode]

  function set(key: keyof Tenant, value: string) {
    setValues((existing) => ({ ...existing, [key]: value }))
    setSaved(false)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    updateTenant.mutate(
      {
        name: current.name,
        legal_name: current.legal_name || null,
        business_type: current.business_type || null,
        industry: current.industry || null,
        email: current.email || null,
        phone: current.phone || null,
        address: current.address || null,
        timezone: current.timezone,
      },
      {
        onSuccess: () => setSaved(true),
        onError: (error) => {
          if (error instanceof ApiError) {
            const fieldErrors: Record<string, string> = {}
            for (const [field, messages] of Object.entries(error.details)) {
              fieldErrors[field] = messages[0]
            }
            setErrors({ ...fieldErrors, form: error.message })
          } else {
            setErrors({ form: 'Could not save organisation settings.' })
          }
        },
      },
    )
  }

  function upgradeOperatingMode(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    updateTenant.mutate(
      { operating_mode: selectedMode },
      {
        onSuccess: () => setModeSaved(true),
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrors({ operating_mode: error.details.operating_mode?.[0] ?? error.message })
          } else {
            setErrors({ operating_mode: 'Could not upgrade the operating mode.' })
          }
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Organisation settings"
        description="Manage your organisation profile and operating mode."
      />

      {!canUpdate && (
        <Alert kind="info">
          You have read-only access to these settings. Only a Business Owner or Administrator can
          change them.
        </Alert>
      )}
      {saved && <Alert kind="success">Organisation settings saved.</Alert>}
      {errors.form && <Alert kind="error">{errors.form}</Alert>}

      <Card title="Operating mode">
        <p className="mb-4 text-sm text-gray-600">
          Choose how your organisation manages sales and stock. You can upgrade from Manual /
          spreadsheets, but an upgrade cannot be reversed.
        </p>
        {operatingModeLocked ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{operatingModeLabel}</p>
            <p className="text-sm text-gray-500">
              Your operating mode is locked after upgrading. You can continue to manage other
              organisation settings below.
            </p>
          </div>
        ) : (
          <form onSubmit={upgradeOperatingMode} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                label="Upgrade operating mode"
                name="upgrade_operating_mode"
                value={selectedMode}
                disabled={!canUpdate}
                error={errors.operating_mode}
                onChange={(event) => {
                  if (event.target.value === 'external' || event.target.value === 'brathamatu_pos') {
                    setSelectedMode(event.target.value)
                    setModeSaved(false)
                    setErrors((currentErrors) => ({ ...currentErrors, operating_mode: '' }))
                  }
                }}
              >
                <option value="external">External POS or ERP</option>
                <option value="brathamatu_pos">BrathaMatu POS</option>
              </Select>
            </div>
            <Button
              type="submit"
              loading={updateTenant.isPending}
              disabled={!canUpdate || selectedMode === tenant.operating_mode}
            >
              Upgrade mode
            </Button>
          </form>
        )}
        {modeSaved && <p className="mt-3 text-sm text-green-700">Operating mode upgraded.</p>}
      </Card>

      <CollapsibleForm>
      <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <fieldset disabled={!canUpdate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trading name" name="name" value={current.name ?? ''} error={errors.name} onChange={(event) => set('name', event.target.value)} />
            <Field label="Legal name" name="legal_name" value={current.legal_name ?? ''} error={errors.legal_name} onChange={(event) => set('legal_name', event.target.value)} />
            <Field label="Industry" name="industry" value={current.industry ?? ''} error={errors.industry} onChange={(event) => set('industry', event.target.value)} />
            <Field label="Business type" name="business_type" value={current.business_type ?? ''} error={errors.business_type} onChange={(event) => set('business_type', event.target.value)} />
            <Field label="Contact email" name="email" type="email" value={current.email ?? ''} error={errors.email} onChange={(event) => set('email', event.target.value)} />
            <Field label="Phone" name="phone" value={current.phone ?? ''} error={errors.phone} onChange={(event) => set('phone', event.target.value)} />
            <Field label="Address" name="address" value={current.address ?? ''} error={errors.address} onChange={(event) => set('address', event.target.value)} />
            <Field label="Timezone" name="timezone" value={current.timezone ?? ''} error={errors.timezone} onChange={(event) => set('timezone', event.target.value)} />
            {operatingModeLocked ? (
              <div className="space-y-1">
                <p className="block text-sm font-medium text-gray-700">Operating mode</p>
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                  {current.operating_mode === 'brathamatu_pos' ? 'BrathaMatu POS' : 'External POS or ERP'}
                </p>
                <p className="text-xs text-gray-500">
                  Operating mode is locked after upgrading from Manual / spreadsheets.
                </p>
              </div>
            ) : (
              <Select
                label="Operating mode"
                name="operating_mode"
                value={current.operating_mode ?? 'manual'}
                onChange={(event) => set('operating_mode', event.target.value)}
              >
                <option value="manual">Manual / spreadsheets</option>
                <option value="external">External POS or ERP</option>
                <option value="brathamatu_pos">BrathaMatu POS</option>
              </Select>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={updateTenant.isPending} disabled={!canUpdate}>
              Save changes
            </Button>
          </div>
        </fieldset>
      </form>
      </CollapsibleForm>

      <Card title="Approval status">
        <p className="text-sm text-gray-600">
          Current status: <span className="font-medium capitalize text-gray-900">{tenant.status}</span>. BrathaMatu reviews new organisations before marketplace services are fully enabled.
        </p>
      </Card>
    </div>
  )
}
