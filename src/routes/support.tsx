import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { SupportPage } from '@/features/support/SupportPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/support')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <SupportPage />
    </AppShell>
  ),
})
