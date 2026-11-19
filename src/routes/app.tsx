import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/app')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
})
