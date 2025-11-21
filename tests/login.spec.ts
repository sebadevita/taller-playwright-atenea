import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/loginPage'
import { DashboardPage } from '../pages/dashboardPage'
import TestData from '../data/testData.json'

let loginPage: LoginPage
let dashboardPage: DashboardPage

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  dashboardPage = new DashboardPage(page)
  await loginPage.visitarPaginaLogin()
})

test('TC-7 Verificar inicio de sesion exitoso', async ({ page }) => {
  await loginPage.completarFormularioLogin(TestData.usuarioValido)
  console.log(TestData.usuarioValido)
  await loginPage.clickLogin()
  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible()
  await expect(dashboardPage.dashboardTitle).toBeVisible()
})

test('TC-11 Loguear nuevo usuario creado por backend', async ({ page, request }) => {
  const endpoint = 'http://localhost:6007/api/auth/signup'
  const email = 'seba' + Date.now().toString() + '@mail.com'
  const response = await request.post(endpoint, {
    data: {
      firstName: TestData.usuarioValido.nombre,
      lastName: TestData.usuarioValido.apellido,
      email: email,
      password: TestData.usuarioValido.password,
    },
  })

  expect(response.status()).toBe(201)

  const responsePromiseLogin = page.waitForResponse('http://localhost:6007/api/auth/login')

  await loginPage.completarFormularioLogin(TestData.usuarioValido)
  await loginPage.clickLogin()

  const responseLogin = await responsePromiseLogin
  const responseLoginJSON = responseLogin.json()

  expect(responseLogin.status()).toBe(200)
  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible()
})
