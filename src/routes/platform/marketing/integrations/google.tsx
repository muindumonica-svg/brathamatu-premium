import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { GoogleIntegrationsPage } from '@/features/marketing/GoogleIntegrationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/integrations/google')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="integrations.google.manage">
          <GoogleIntegrationsPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
