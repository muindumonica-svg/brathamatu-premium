import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/onboarding')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <OnboardingPage />
    </AppShell>
  ),
})
