import { expect, test } from '@playwright/test'
import { ACCOUNTS, login } from './helpers'

test('tenant can add a product with selling price and selected packaging units', async ({ page }) => {
  const productName = `E2E Product ${Date.now()}`
  const sku = `E2E-${Date.now()}`

  await login(page, ACCOUNTS.owner)
  await page.goto('/business/catalogue')
  await page.locator('details').filter({ hasText: 'Add a product' }).first().locator('summary').click()
  await page.getByLabel('Product name').fill(productName)
  await page.getByLabel('SKU').fill(sku)
  await page.getByLabel('Base unit', { exact: true }).selectOption('piece')
  await page.getByLabel('Packaging unit', { exact: true }).selectOption('piece')
  await page.getByLabel('Base units per pack').fill('6')
  await page.getByLabel('Selling price (KSh)').fill('220')
  await page.getByRole('button', { name: 'Add product' }).click()

  await expect(page.getByText(`${productName} added to the catalogue.`)).toBeVisible()
  const productRow = page.getByRole('row').filter({ hasText: productName })
  await expect(productRow).toContainText('220')
  await expect(productRow).toContainText('1 piece = 6 piece')
})
