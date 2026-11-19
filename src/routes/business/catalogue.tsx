import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { CataloguePage } from '@/features/catalogue/CataloguePage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/catalogue')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <CataloguePage />
      </RequireTenant>
    </AppShell>
  ),
})
