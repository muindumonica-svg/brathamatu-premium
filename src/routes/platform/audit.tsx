import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformAuditPage } from '@/features/platform/PlatformAuditPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/audit')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformAuditPage />
      </RequirePlatform>
    </AppShell>
  ),
})
