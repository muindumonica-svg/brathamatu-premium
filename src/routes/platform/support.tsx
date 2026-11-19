import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { PlatformSupportPage } from '@/features/platform/PlatformSupportPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/support')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="support.view">
          <PlatformSupportPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
