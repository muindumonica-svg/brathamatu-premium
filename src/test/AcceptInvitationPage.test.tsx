import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AcceptInvitationPage } from '../features/invitations/AcceptInvitationPage'

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    useRouter: () => ({ navigate: vi.fn() }),
  }
})

function renderInvitationPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AcceptInvitationPage />
    </QueryClientProvider>,
  )
}

describe('AcceptInvitationPage', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/invitations/accept?token=invite-token')
    vi.restoreAllMocks()
  })

  it('activates the invited account and instructs the member to change the emailed temporary password', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      if (init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            data: { activated: true, email: 'new.member@example.test' },
            meta: { request_id: 'req-1', timestamp: '2026-11-18T00:00:00Z' },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }

      return new Response(
        JSON.stringify({
          data: {
            invitation_id: 'invitation-1',
            organisation: 'Acme Retail',
            email: 'new.member@example.test',
            role: 'Staff',
            branch: null,
            account_setup_required: true,
            status: 'pending',
            expires_at: '2026-11-25T00:00:00Z',
          },
          meta: { request_id: 'req-2', timestamp: '2026-11-18T00:00:00Z' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    })

    renderInvitationPage()

    await userEvent.type(await screen.findByLabelText('Your name'), 'New Member')
    expect(screen.queryByLabelText('Create password')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Activate account and accept' }))

    expect(await screen.findByRole('status')).toHaveTextContent(/required to change it on first sign-in/i)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const activationCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url) === '/api/v1/public/invitations/invite-token/activate' && init?.method === 'POST',
    )
    expect(fetchMock.mock.calls.some(([url]) => String(url) === '/api/v1/public/invitations/invite-token')).toBe(true)
    expect(activationCall?.[0]).toBe('/api/v1/public/invitations/invite-token/activate')
    expect(JSON.parse(String(activationCall?.[1]?.body))).toEqual({ name: 'New Member' })
  })
})
