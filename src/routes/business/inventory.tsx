import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { InventoryPage } from '@/features/inventory/InventoryPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/inventory')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <InventoryPage />
      </RequireTenant>
    </AppShell>
  ),
})
