import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/app/routeGuards'
import { RegisterPage } from '@/features/auth/RegisterPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/register')({
  ssr: false,
  beforeLoad: redirectIfAuthed,
  component: RegisterPage,
})
