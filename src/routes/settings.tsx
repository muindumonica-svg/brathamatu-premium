import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { TenantSettingsPage } from '@/features/tenant/TenantSettingsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/settings')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <TenantSettingsPage />
      </RequireTenant>
    </AppShell>
  ),
})
