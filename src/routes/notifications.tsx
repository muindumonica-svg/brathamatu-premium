import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { NotificationsPage } from '@/features/account/NotificationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/notifications')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <NotificationsPage />
    </AppShell>
  ),
})
