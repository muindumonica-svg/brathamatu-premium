import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { PlatformReportsPage } from '@/features/reports/ReportsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/reports')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="report.view">
          <PlatformReportsPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
