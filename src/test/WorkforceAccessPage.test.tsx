import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WorkforceAssignmentsPage } from '../features/workforce/WorkforceAssignmentsPage'
import { WorkforceEarningsPage } from '../features/workforce/WorkforceEarningsPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; to?: string }) => (
    <a href={typeof props.to === 'string' ? props.to : '#'}>{children}</a>
  ),
}))

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderPage(page: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{page}</QueryClientProvider>)
}

describe('workforce eligibility pages', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('brathamatu.auth.token', '1|applicant-test')
    vi.restoreAllMocks()
  })

  it('does not request assignment offers from an applicant account', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/me')) {
        return jsonResponse({
          id: 'applicant-1',
          name: 'Test Applicant',
          email: 'applicant@example.test',
          email_verified_at: '2026-11-19T00:00:00Z',
          created_at: '2026-11-19T00:00:00Z',
          roles: [{ slug: 'applicant', name: 'Applicant', scope: 'workforce', tenant_id: null }],
          permissions: ['workforce.profile.view'],
          tenants: [],
          current_tenant: null,
        })
      }
      if (url.endsWith('/workforce/profile')) return jsonResponse({ profile: null })
      throw new Error(`Unexpected request: ${url}`)
    })

    renderPage(<WorkforceAssignmentsPage />)

    expect(await screen.findByText(/Assignment offers become available after your workforce profile is verified/i))
      .toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/workforce/assignments'))).toBe(false)
  })

  it('does not request earnings until the account has earnings permission', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        id: 'applicant-1',
        name: 'Test Applicant',
        email: 'applicant@example.test',
        email_verified_at: '2026-11-19T00:00:00Z',
        created_at: '2026-11-19T00:00:00Z',
        roles: [{ slug: 'applicant', name: 'Applicant', scope: 'workforce', tenant_id: null }],
        permissions: ['workforce.profile.view'],
        tenants: [],
        current_tenant: null,
      }),
    )

    renderPage(<WorkforceEarningsPage />)

    expect(await screen.findByText(/Earnings become available after you are eligible for workforce assignments/i))
      .toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith('/workforce/earnings'))).toBe(false)
  })
})
