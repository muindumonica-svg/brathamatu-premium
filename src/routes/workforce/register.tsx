import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/app/routeGuards'
import { WorkforceRegisterPage } from '@/features/auth/WorkforceRegisterPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/workforce/register')({
  ssr: false,
  beforeLoad: redirectIfAuthed,
  component: WorkforceRegisterPage,
})
