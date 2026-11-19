import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { TenantStocktakeJobPage } from '@/features/stocktake/TenantStocktakeJobPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/stocktaking/$jobId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <TenantStocktakeJobPage />
      </RequireTenant>
    </AppShell>
  ),
})
