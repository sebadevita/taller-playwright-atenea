import { test, expect } from '@playwright/test'
import { RegisterPage } from '../pages/registerPage'
import TestData from '../data/testData.json'
import { BackendUtils } from './utils/backendUtils'

let registerPage: RegisterPage
let backendUtils: BackendUtils

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page)
  await registerPage.visitarPaginaRegistro()
})

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await expect(registerPage.firstNameInput).toBeVisible()
  await expect(registerPage.lastNameInput).toBeVisible()
  await expect(registerPage.emailInput).toBeVisible()
  await expect(registerPage.passwordInput).toBeVisible()
  await expect(registerPage.registerButton).toBeVisible()
})

test('TC-2 Verificar botón de registro esta deshabilitado por defecto', async ({ page }) => {
  await expect(registerPage.registerButton).toBeDisabled()
})

test('TC-3 Verificar botón de registro se habilite al completar los campos obliagatorios', async ({ page }) => {
  await registerPage.completarFormularioRegistro(TestData.usuarioValido)

  await expect(registerPage.registerButton).toBeEnabled()
})

test('TC-4 Verificar redireccionamiento a página de Inicio de sesión al hacer click', async ({ page }) => {
  await registerPage.loginButton.click()
  await expect(page).toHaveURL('http://localhost:3000/login')
})

test.skip('TC-5 Verificar registro exitoso con datos válidos ', async ({ page }) => {
  //Modificamos el email del usuario que viene del json

  const email = 'seba' + Date.now().toString()
  TestData.usuarioValido.email = email
  await registerPage.completarFormularioRegistro(TestData.usuarioValido)
  await registerPage.registerButton.click()
  await expect(page.getByText('Registro exitoso')).toBeVisible()
})

test.skip('TC-6 Verificar que un usuario no pueda registrarse con un correo ya existente', async ({ page }) => {
  //Modificamos el email del usuario que viene del json

  const email = 'seba' + Date.now().toString()
  TestData.usuarioValido.email = email
  await registerPage.completarFormularioRegistro(TestData.usuarioValido)
  await registerPage.registerButton.click()

  await expect(page.getByText('Registro exitoso')).toBeVisible()

  await registerPage.visitarPaginaRegistro()

  await registerPage.completarFormularioRegistro(TestData.usuarioValido)
  await registerPage.registerButton.click()

  await expect(page.getByText('Email already in use')).toBeVisible()

  await expect(page.getByText('Registro exitoso')).not.toBeVisible()
})

test.skip('TC-8 Verificar Registro exitoso verificando con respuesta de API', async ({ page }) => {
  const email = 'seba' + Date.now().toString() + '@mail.com'
  TestData.usuarioValido.email = email
  await registerPage.completarFormularioRegistro(TestData.usuarioValido)

  //Verificamos que la API signup responda 201

  const responsePromise = page.waitForResponse('http://localhost:6007/api/auth/signup')
  await registerPage.registerButton.click()
  const response = await responsePromise

  //Transformamos la respuesta a objeto json
  const responseBody = await response.json()

  expect(response.status()).toBe(201)

  //Verificamos que el json de la response tenga la property token y user
  expect(responseBody).toHaveProperty('token')
  expect(responseBody).toHaveProperty('user')

  //Verificamos que la property user tenga dentro el json con los atributos del user
  expect(responseBody.user).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      firstName: TestData.usuarioValido.nombre,
      lastName: TestData.usuarioValido.apellido,
      email: TestData.usuarioValido.email,
    })
  )
  await expect(page.getByText('Registro exitoso')).toBeVisible()
})

test('TC-9.1 Registrar de usuario desde la API', async ({ request }) => {
  const userAPI = new BackendUtils(request)
  const endpoint = 'http://localhost:6007/api/auth/signup'
  const nuevoUsuario = await userAPI.crearUsuarioAPI(endpoint, TestData.usuarioValido)

  expect(nuevoUsuario).toEqual(
    expect.objectContaining({
      email: expect.any(String),
      password: expect.any(String),
    })
  )
})

test('TC-10 Verificar comportamiento con error 500', async ({ page }) => {
  //Interceptar la request
  await page.route('http://localhost:6007/api/auth/signup', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ messge: 'Internal Server Error' }),
    })
  })

  await registerPage.completarFormularioRegistro(TestData.usuarioValido)
  await registerPage.registerButton.click()
  await expect(page.getByText('Registro fallido')).toBeVisible()
})
