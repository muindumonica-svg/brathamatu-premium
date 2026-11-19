import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformOverviewPage } from '@/features/platform/PlatformOverviewPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformOverviewPage />
      </RequirePlatform>
    </AppShell>
  ),
})
