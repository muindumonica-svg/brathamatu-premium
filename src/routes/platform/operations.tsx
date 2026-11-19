import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireAnyPermission, RequirePlatform } from '@/components/Guards'
import { PlatformOperationsPage } from '@/features/operations/PlatformOperationsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/operations')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequireAnyPermission
          permissions={[
            'stocktake.job.monitor',
            'stocktake.job.assign',
            'stocktake.job.review',
            'sop.manage',
          ]}
        >
          <PlatformOperationsPage />
        </RequireAnyPermission>
      </RequirePlatform>
    </AppShell>
  ),
})
