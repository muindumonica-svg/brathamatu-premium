import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { PlatformStockTakerDetailPage } from '@/features/workforce/PlatformStockTakerDetailPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/workforce/$profileId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="workforce.view">
          <PlatformStockTakerDetailPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
