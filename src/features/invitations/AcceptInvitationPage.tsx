import { useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Alert, Button, Field, PageLoader } from '../../components/ui'
import { ApiError, getStoredToken } from '../../lib/api/client'
import {
  useAcceptInvitation,
  useActivateInvitation,
  useCurrentUser,
  useInvitationPreview,
} from '../../lib/auth/hooks'
import { formatDateTime } from '../../lib/formatting'
import { AuthLayout } from '../auth/LoginPage'
import { CollapsibleForm } from '../../components/ui'

function currentToken(): string | null {
  return new URLSearchParams(window.location.search).get('token')
}

export function AcceptInvitationPage() {
  const token = currentToken()
  const authed = Boolean(getStoredToken())
  const router = useRouter()
  const accept = useAcceptInvitation()
  const activate = useActivateInvitation()
  const currentUser = useCurrentUser()
  const preview = useInvitationPreview(token ?? undefined)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activated, setActivated] = useState(false)

  if (!token) {
    return (
      <AuthLayout title="Invitation" subtitle="Accept your invitation to join an organisation">
        <Alert kind="error">This invitation link is missing its token. Ask an administrator for a new link.</Alert>
      </AuthLayout>
    )
  }
  const invitationToken = token

  if (preview.isLoading || (authed && currentUser.isLoading)) {
    return (
      <AuthLayout title="Invitation" subtitle="Checking your invitation">
        <PageLoader label="Loading invitation…" />
      </AuthLayout>
    )
  }

  if (preview.isError || !preview.data) {
    return (
      <AuthLayout title="Invitation" subtitle="This link could not be opened">
        <Alert kind="error">
          {preview.error instanceof ApiError
            ? preview.error.message
            : 'This invitation may have been revoked or already used.'}
        </Alert>
      </AuthLayout>
    )
  }

  const invitation = preview.data
  const emailMismatch =
    currentUser.data?.email &&
    currentUser.data.email.toLowerCase() !== invitation.email.toLowerCase()
  const invitationIsPending = invitation.status === 'pending'
  const redirect = `/invitations/accept?token=${encodeURIComponent(invitationToken)}`

  function submitActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    activate.mutate(
      { token: invitationToken, name },
      {
        onSuccess: () => setActivated(true),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : 'Your account could not be activated. Please try again.',
          ),
      },
    )
  }

  return (
    <AuthLayout title="Organisation invitation" subtitle={invitation.organisation ?? 'BrathaMatu'}>
      <div className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}
        {activated && (
          <Alert kind="success">
            Your account is activated. Sign in with {invitation.email} and the temporary password from your
            invitation email. You will be required to change it on first sign-in.
          </Alert>
        )}
        {currentUser.isError && authed && (
          <Alert kind="error">
            Your saved sign-in session has expired. Sign in with {invitation.email} to accept this invitation.
          </Alert>
        )}
        {emailMismatch && (
          <Alert kind="error">
            You are signed in as {currentUser.data?.email}. This invitation was sent to {invitation.email}. Sign
            in with the invited address to accept it.
          </Alert>
        )}
        {!authed && (
          <p className="text-sm text-gray-600">
            {invitation.account_setup_required
              ? 'Activate your account with the invited email address. A temporary password was sent in the invitation email; you will be required to change it on first sign-in.'
              : 'Sign in with the invited email address to accept this organisation invitation. If you do not have an account yet, ask the organisation administrator to resend the invitation.'}
          </p>
        )}
        {invitation.status !== 'pending' && (
          <Alert kind="info">This invitation is {invitation.status} and can no longer be accepted.</Alert>
        )}

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Organisation</dt>
            <dd className="font-medium text-gray-900">{invitation.organisation ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Invited email</dt>
            <dd className="font-medium text-gray-900">{invitation.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium text-gray-900">{invitation.role ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Branch access</dt>
            <dd className="font-medium text-gray-900">{invitation.branch ?? 'All branches'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Expires</dt>
            <dd className="font-medium text-gray-900">
              {invitation.expires_at ? formatDateTime(invitation.expires_at) : '—'}
            </dd>
          </div>
        </dl>

        {invitationIsPending && !authed && invitation.account_setup_required && !activated && (
          <CollapsibleForm>
          <form className="space-y-4" onSubmit={submitActivation}>
            <Field
              label="Your name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
            <Button className="w-full" type="submit" loading={activate.isPending}>
              Activate account and accept
            </Button>
          </form>
          </CollapsibleForm>
        )}

        {invitationIsPending && authed && !emailMismatch && currentUser.data && (
          <Button
            className="w-full"
            loading={accept.isPending}
            onClick={() => {
              setError(null)
              accept.mutate(invitationToken, {
                onSuccess: () => router.navigate({ to: '/app' }),
                onError: (err) =>
                  setError(err instanceof ApiError ? err.message : 'The invitation could not be accepted.'),
              })
            }}
          >
            Accept invitation
          </Button>
        )}

        {invitationIsPending && (emailMismatch || currentUser.isError) && (
          <a
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign in with invited email
          </a>
        )}

        {!authed && (
          <p className="text-center text-sm text-gray-600">
            {activated ? 'Your account is ready. ' : 'Already have an account? '}
            <a className="font-medium text-brand-700 hover:text-brand-800" href={`/login?redirect=${encodeURIComponent(redirect)}`}>
              Sign in
            </a>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
