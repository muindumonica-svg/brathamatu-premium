import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireWorkforce } from '@/components/Guards'
import { WorkforceAssignmentsPage } from '@/features/workforce/WorkforceAssignmentsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/workforce/assignments')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireWorkforce>
        <WorkforceAssignmentsPage />
      </RequireWorkforce>
    </AppShell>
  ),
})
