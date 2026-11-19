import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { TeamPage } from '@/features/tenant/TeamPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/team')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <TeamPage />
      </RequireTenant>
    </AppShell>
  ),
})
