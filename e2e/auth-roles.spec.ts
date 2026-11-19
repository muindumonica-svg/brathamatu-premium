import { expect, test } from '@playwright/test'
import { ACCOUNTS, expectNoCrash, login } from './helpers'

test.describe('role-aware access', () => {
  test('tenant admin upgrades mode and assigns a permission-bundled staff role', async ({ page, request }) => {
    await login(page, ACCOUNTS.pharmacy)
    await expect(page.getByRole('complementary', { name: 'BrathaMatu POS upgrade' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Upgrade to BrathaMatu POS' })).toHaveAttribute('href', '/settings')
    await expect(page.getByRole('link', { name: 'See POS and stock-taking benefits' })).toHaveAttribute(
      'href',
      '/brathamatu-pos',
    )

    await page.goto('/settings')
    await expect(page.getByLabel('Upgrade operating mode')).toBeVisible()
    await page.getByLabel('Upgrade operating mode').selectOption('external')
    await page.getByRole('button', { name: 'Upgrade mode' }).click()
    await expect(page.getByText(/Your operating mode is locked after upgrading/)).toBeVisible()
    await expect(page.getByLabel('Upgrade operating mode')).toHaveCount(0)

    const identity = await page.evaluate(() => ({
      token: localStorage.getItem('brathamatu.auth.token'),
    }))
    expect(identity.token).toBeTruthy()
    const apiBase = process.env.E2E_API_URL ?? 'http://127.0.0.1:8000/api/v1'
    const me = await request.get(`${apiBase}/me`, {
      headers: { Authorization: `Bearer ${identity.token}` },
    })
    expect(me.ok()).toBeTruthy()
    const tenantId = (await me.json()).data.current_tenant.id as string
    const downgrade = await request.patch(`${apiBase}/tenants/${tenantId}`, {
      headers: { Authorization: `Bearer ${identity.token}` },
      data: { operating_mode: 'manual' },
    })
    expect(downgrade.status()).toBe(422)

    await page.goto('/business/team')
    await expect(page.getByRole('heading', { level: 1, name: 'Team members' })).toBeVisible()
    const adminRole = page.locator('details').filter({ hasText: 'Business Administrator' }).first()
    await adminRole.locator('summary').click()
    await expect(adminRole.getByText('Invite staff and manage their roles and branch access')).toBeVisible()

    await page.getByText('Show form', { exact: true }).click()
    const inviteEmail = `e2e-${Date.now()}@example.test`
    await page.getByLabel('Email address').fill(inviteEmail)
    await page.getByLabel('Role').selectOption('pos-cashier')
    await expect(page.getByText('POS Cashier permissions')).toBeVisible()
    const rolePreview = page.getByText('POS Cashier permissions').locator('..')
    await expect(rolePreview.locator('[title="pos.sales.create"]')).toHaveText('Process POS sales')
    await page.getByRole('button', { name: 'Create invitation' }).click()
    await expect(page.getByRole('row').filter({ hasText: inviteEmail })).toBeVisible()
  })

  test('tenant owner reaches the tenant workspace and is denied platform pages', async ({ page }) => {
    await login(page, ACCOUNTS.owner)
    await expect(page.getByTestId('current-user')).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'BrathaMatu POS upgrade' })).toHaveCount(0)
    await expect(page.getByText('Complete your setup')).toBeVisible()
    await expect(page.getByRole('button', { name: /Business profile/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Branches/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Stock locations/ })).toBeVisible()

    await page.goto('/platform')
    await expect(
      page.getByText('Platform administration is only available to BrathaMatu platform roles.'),
    ).toBeVisible()

    await page.goto('/business/catalogue')
    await expect(page.getByRole('heading', { level: 1, name: 'Catalogue' })).toBeVisible()
    await expect(page.getByText('Sugar 1kg').first()).toBeVisible()
    await expectNoCrash(page)
  })

  test('platform superadmin reaches platform operations, reports and support', async ({ page }) => {
    await login(page, ACCOUNTS.platform)

    await page.goto('/platform')
    await expect(page.getByRole('heading', { level: 1, name: 'Operations overview' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Tenants' })).toBeVisible()

    await page.goto('/platform/reports')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Platform reports & analytics' }),
    ).toBeVisible()

    await page.goto('/platform/support')
    await expect(page.getByRole('heading', { level: 1, name: 'Support queue' })).toBeVisible()
    await expectNoCrash(page)
  })

  test('workforce worker reaches assignments, profile and earnings', async ({ page }) => {
    await login(page, ACCOUNTS.worker)

    await page.goto('/workforce/assignments')
    await expect(page.getByRole('heading', { level: 1, name: 'Assignments' })).toBeVisible()

    await page.goto('/workforce/profile')
    await expect(
      page.getByRole('heading', { level: 1, name: 'My workforce profile' }),
    ).toBeVisible()

    await page.goto('/workforce/earnings')
    await expect(page.getByRole('heading', { level: 1, name: 'Earnings' })).toBeVisible()
    await expectNoCrash(page)
  })
})
