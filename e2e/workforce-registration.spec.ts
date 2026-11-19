import { expect, test } from '@playwright/test'

test('a stock-taker applicant can sign up, verify email, and complete profile onboarding', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Apply to join the workforce' }).click()
  await expect(page.getByRole('heading', { name: 'Apply as a stock taker' })).toBeVisible()

  await page.getByText('Show form', { exact: true }).click()
  const email = `workforce-${Date.now()}@example.test`
  await page.getByLabel('Full name').fill('Browser Test Applicant')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('SecurePass123')
  await page.getByLabel('Confirm password').fill('SecurePass123')
  await page.getByRole('button', { name: 'Create stock taker account' }).click()

  await expect(page).toHaveURL(/\/verify$/)
  const codeAlert = page.getByText(/Test-mode verification code:/)
  await expect(codeAlert).toBeVisible()
  const code = (await codeAlert.innerText()).match(/\b\d{6}\b/)?.[0]
  expect(code).toBeTruthy()

  await page.getByText('Show form', { exact: true }).click()
  await page.getByLabel('Six-digit code').fill(code!)
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page).toHaveURL(/\/workforce\/profile$/)

  await page.getByText('Show form', { exact: true }).click()
  await page.getByLabel('Legal name').fill('Browser Test Applicant')
  await page.getByLabel('I accept the stock-taker terms and confirm I will record physical quantities only — I will never see tenant charges or platform margins.').check()
  await page.getByRole('button', { name: 'Create profile' }).click()
  await expect(page.getByText('Personal details', { exact: true })).toBeVisible()

  const profile = await page.evaluate(async () => {
    const token = localStorage.getItem('brathamatu.auth.token')
    const response = await fetch('/api/v1/workforce/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await response.json() as { data: { profile: { level: string } } }
    return { status: response.status, level: body.data.profile.level }
  })
  expect(profile.status).toBe(200)
  expect(profile.level).toBe('applicant')
})
