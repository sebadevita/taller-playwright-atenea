import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly dashboardTitle: Locator
  readonly botonAgregarCuenta: Locator
  readonly botonEnviarDinero: Locator

  constructor(page: Page) {
    this.page = page
    this.dashboardTitle = page.getByTestId('titulo-dashboard')
    this.botonAgregarCuenta = page.getByTestId('tarjeta-agregar-cuenta')
    this.botonEnviarDinero = page.getByTestId('boton-enviar')
  }

  async visitarPaginaDashboard() {
    return await this.page.goto('http://localhost:3000/dashboard')
  }
}
