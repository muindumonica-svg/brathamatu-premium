import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { ChangeInitialPasswordPage } from '@/features/auth/ChangeInitialPasswordPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/change-initial-password')({
  ssr: false,
  beforeLoad: requireAuth,
  component: ChangeInitialPasswordPage,
})
