import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePlatform } from '@/components/Guards'
import { PlatformCataloguePricingPage } from '@/features/platform/PlatformCataloguePricingPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/catalogue-pricing')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <PlatformCataloguePricingPage />
      </RequirePlatform>
    </AppShell>
  ),
})
