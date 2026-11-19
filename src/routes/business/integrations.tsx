import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequireTenant } from '@/components/Guards'
import { IntegrationsPage } from '@/features/integrations/IntegrationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/integrations')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <RequirePermission permission="integration.manage">
          <IntegrationsPage />
        </RequirePermission>
      </RequireTenant>
    </AppShell>
  ),
})
