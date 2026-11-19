import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { StocktakePolicyPage } from '@/features/stocktake/StocktakePolicyPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/stocktake-policy')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <StocktakePolicyPage />
      </RequirePlatform>
    </AppShell>
  ),
})
