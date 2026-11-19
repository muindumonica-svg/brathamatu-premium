import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { TenantResultsReviewPage } from '@/features/review/TenantResultsReviewPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/stocktaking/$jobId/review')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <TenantResultsReviewPage />
      </RequireTenant>
    </AppShell>
  ),
})
