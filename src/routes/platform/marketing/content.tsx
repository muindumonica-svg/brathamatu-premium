import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { ContentLibraryPage } from '@/features/marketing/ContentLibraryPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/content')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="cms.view">
          <ContentLibraryPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
