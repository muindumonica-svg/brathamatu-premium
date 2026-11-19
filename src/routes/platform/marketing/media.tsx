import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { MediaLibraryPage } from '@/features/marketing/MediaLibraryPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/marketing/media')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="media.manage">
          <MediaLibraryPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
