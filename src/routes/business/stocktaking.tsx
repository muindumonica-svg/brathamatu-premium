import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { TenantStocktakePage } from '@/features/stocktake/TenantStocktakePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/stocktaking')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <TenantStocktakePage />
      </RequireTenant>
    </AppShell>
  ),
})
