import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformStocktakeJobsPage } from '@/features/stocktake/PlatformStocktakeJobsPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/stocktaking-jobs')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformStocktakeJobsPage />
      </RequirePlatform>
    </AppShell>
  ),
})
