import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/app/routeGuards'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/forgot-password')({
  ssr: false,
  beforeLoad: redirectIfAuthed,
  component: ForgotPasswordPage,
})
