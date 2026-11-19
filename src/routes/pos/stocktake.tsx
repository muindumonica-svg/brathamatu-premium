import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { PosStocktakePage } from '@/features/pos/PosStocktakePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/pos/stocktake')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <PosStocktakePage />
      </RequireTenant>
    </AppShell>
  ),
})
