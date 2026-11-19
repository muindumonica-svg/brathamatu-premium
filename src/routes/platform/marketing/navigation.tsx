import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { NavigationPage } from '@/features/marketing/NavigationPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/navigation')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="cms.view">
          <NavigationPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
