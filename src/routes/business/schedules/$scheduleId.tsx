import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { ScheduleDetailPage } from '@/features/schedule/ScheduleDetailPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/schedules/$scheduleId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <ScheduleDetailPage />
      </RequireTenant>
    </AppShell>
  ),
})
