import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { PosShiftsPage } from '@/features/pos/PosShiftsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/pos/shifts')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <PosShiftsPage />
      </RequireTenant>
    </AppShell>
  ),
})
