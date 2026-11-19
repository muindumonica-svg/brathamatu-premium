import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformTenantDetailPage } from '@/features/platform/PlatformTenantDetailPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/tenants/$tenantId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformTenantDetailPage />
      </RequirePlatform>
    </AppShell>
  ),
})
