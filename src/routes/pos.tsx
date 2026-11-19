import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { PosTerminalPage } from '@/features/pos/PosTerminalPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/pos')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <PosTerminalPage />
      </RequireTenant>
    </AppShell>
  ),
})
