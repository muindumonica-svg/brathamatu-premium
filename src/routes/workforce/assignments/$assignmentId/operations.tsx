import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireWorkforce } from '@/components/Guards'
import { WorkerAssignmentOperationsPage } from '@/features/operations/WorkerAssignmentOperationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/workforce/assignments/$assignmentId/operations')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireWorkforce>
        <WorkerAssignmentOperationsPage />
      </RequireWorkforce>
    </AppShell>
  ),
})
