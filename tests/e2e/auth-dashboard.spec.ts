import { expect, test } from '@playwright/test'

test('admin can sign in and see the dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@vanillato.local')
  await page.getByLabel('Senha').fill('admin123456')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Novo Pedido/ })).toBeVisible()
})
