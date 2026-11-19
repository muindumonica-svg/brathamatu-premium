import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { SchedulePage } from '@/features/schedule/SchedulePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/schedules')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <SchedulePage />
      </RequireTenant>
    </AppShell>
  ),
})
