import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly dashboardTitle: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name=email]')
    this.passwordInput = page.locator('input[name=password]')
    this.loginButton = page.getByTestId('boton-login')
  }

  async visitarPaginaLogin() {
    return await this.page.goto('http://localhost:3000/login')
  }

  async completarFormularioLogin(usuario: { email: string; password: string }) {
    await this.emailInput.fill(usuario.email)
    await this.passwordInput.fill(usuario.password)
  }

  async clickLogin() {
    await this.loginButton.click()
  }
}
