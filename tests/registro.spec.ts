import { test, expect } from '@playwright/test'
import { RegisterPage } from '../pages/registerPage'
import TestData from '../data/testData.json'

let registerPage: RegisterPage

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

test('TC-4 Verificar redireccionamiento a pagina de Inicio de sesión al hacer click', async ({ page }) => {
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
