import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequirePermission, RequirePlatform } from '@/components/Guards'
import { QAReviewPage } from '@/features/qa/QAReviewPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/platform/stocktaking-jobs/$jobId/qa')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequirePlatform>
        <RequirePermission permission="qa.review">
          <QAReviewPage />
        </RequirePermission>
      </RequirePlatform>
    </AppShell>
  ),
})
