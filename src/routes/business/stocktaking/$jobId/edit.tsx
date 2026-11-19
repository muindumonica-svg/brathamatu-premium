import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { StocktakeRequestPage } from '@/features/stocktake/StocktakeRequestPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/stocktaking/$jobId/edit')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <StocktakeRequestPage mode="edit" />
      </RequireTenant>
    </AppShell>
  ),
})
