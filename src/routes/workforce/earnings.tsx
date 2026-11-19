import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireWorkforce } from '@/components/Guards'
import { WorkforceEarningsPage } from '@/features/workforce/WorkforceEarningsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/workforce/earnings')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireWorkforce>
        <WorkforceEarningsPage />
      </RequireWorkforce>
    </AppShell>
  ),
})
