import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequireTenant } from '@/components/Guards'
import { ReportsPage } from '@/features/reports/ReportsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/reports')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <RequirePermission permission="report.view">
          <ReportsPage />
        </RequirePermission>
      </RequireTenant>
    </AppShell>
  ),
})
