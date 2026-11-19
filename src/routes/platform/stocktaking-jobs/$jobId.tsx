import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformStocktakeJobPage } from '@/features/stocktake/PlatformStocktakeJobPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/stocktaking-jobs/$jobId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformStocktakeJobPage />
      </RequirePlatform>
    </AppShell>
  ),
})
