import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireWorkforce } from '@/components/Guards'
import { WorkforceProfilePage } from '@/features/workforce/WorkforceProfilePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/workforce/profile')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireWorkforce>
        <WorkforceProfilePage />
      </RequireWorkforce>
    </AppShell>
  ),
})
