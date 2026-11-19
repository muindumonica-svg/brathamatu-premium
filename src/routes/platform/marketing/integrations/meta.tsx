import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { MetaIntegrationsPage } from '@/features/marketing/MetaIntegrationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/integrations/meta')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="integrations.meta.manage">
          <MetaIntegrationsPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
