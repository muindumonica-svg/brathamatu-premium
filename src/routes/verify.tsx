import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { VerifyPage } from '@/features/auth/VerifyPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/verify')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <VerifyPage />
    </AppShell>
  ),
})
