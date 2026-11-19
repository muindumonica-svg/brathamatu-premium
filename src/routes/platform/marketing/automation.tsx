import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { AutomationPage } from '@/features/marketing/AutomationPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/automation')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="automation.view">
          <AutomationPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
