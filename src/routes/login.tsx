import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/app/routeGuards'
import { LoginPage } from '@/features/auth/LoginPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/login')({
  ssr: false,
  beforeLoad: redirectIfAuthed,
  component: LoginPage,
})
