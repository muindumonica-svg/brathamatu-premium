import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { ProfilePage } from '@/features/account/ProfilePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/profile')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
})
