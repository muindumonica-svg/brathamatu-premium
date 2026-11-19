import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { PosBackOfficePage } from '@/features/pos/PosBackOfficePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/pos/back-office')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <PosBackOfficePage />
      </RequireTenant>
    </AppShell>
  ),
})
