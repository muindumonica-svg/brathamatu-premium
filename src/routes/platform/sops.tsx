import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { SopTemplatesPage } from '@/features/operations/SopTemplatesPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/sops')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="sop.manage">
          <SopTemplatesPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
