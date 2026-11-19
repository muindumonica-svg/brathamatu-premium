import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationPage } from '@/features/invitations/AcceptInvitationPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/invitations/accept')({
  ssr: false,
  component: AcceptInvitationPage,
})
