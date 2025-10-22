import { test, expect } from '@playwright/test'

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  await expect(page.locator('input[name=firstName]')).toBeVisible()
  await expect(page.locator('input[name=lastName]')).toBeVisible()
  await expect(page.locator('input[name=email]')).toBeVisible()
  await expect(page.locator('input[name=password]')).toBeVisible()

  await expect(page.getByTestId('boton-registrarse')).toBeVisible()
  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Playwright/)
})

test('TC-2 Verificar botón de registro esta deshabilitado por defecto', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled()
})

test('TC-3 Verificar botón de registro se habilite al completar los campos obliagatorios', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  await page.fill('input[name=firstName]', 'Seba')
  await page.fill('input[name=lastName]', 'Prueba')
  await page.fill('input[name=email]', 'seba@mail.com')
  await page.fill('input[name=password]', 'password123')

  await expect(page.getByTestId('boton-registrarse')).toBeEnabled()
})

test('TC-4 Verificar redireccionamiento a pagina de Inicio de sesión al hacer click', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByTestId('boton-login-header-signup').click()
  await expect(page).toHaveURL('http://localhost:3000/login')
})

test.skip('TC-5 Verificar registro exitoso con datos válidos ', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  await page.fill('input[name=firstName]', 'Seba')
  await page.fill('input[name=lastName]', 'Prueba')
  await page.fill('input[name=email]', 'seba' + Date.now().toString() + '@mail.com')
  await page.fill('input[name=password]', 'password123')
  await page.getByTestId('boton-registrarse').click()

  await expect(page.getByText('Registro exitoso')).toBeVisible()
})

test.skip('TC-6 Verificar que un usuario no pueda registrarse con un correo ya existente', async ({ page }) => {
  const email = 'seba' + Date.now().toString() + '@mail.com'

  await page.goto('http://localhost:3000/')

  await page.fill('input[name=firstName]', 'Seba')
  await page.fill('input[name=lastName]', 'Prueba')
  await page.fill('input[name=email]', email)
  await page.fill('input[name=password]', 'password123')
  await page.getByTestId('boton-registrarse').click()

  await expect(page.getByText('Registro exitoso')).toBeVisible()

  await page.goto('http://localhost:3000/')

  await page.fill('input[name=firstName]', 'Seba')
  await page.fill('input[name=lastName]', 'Prueba')
  await page.fill('input[name=email]', email)
  await page.fill('input[name=password]', 'password123')
  await page.getByTestId('boton-registrarse').click()

  await expect(page.getByText('Email already in use')).toBeVisible()

  await expect(page.getByText('Registro exitoso')).not.toBeVisible()
})
