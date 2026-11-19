import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { LocationsPage } from '@/features/tenant/LocationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/locations')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <LocationsPage />
      </RequireTenant>
    </AppShell>
  ),
})
