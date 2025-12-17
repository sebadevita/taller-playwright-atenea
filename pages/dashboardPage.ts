import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly dashboardTitle: Locator
  readonly botonAgregarCuenta: Locator
  readonly botonEnviarDinero: Locator
  readonly descripcionesListaTransferencias: Locator
  readonly montosListaTransferecnias: Locator
  readonly elementosListaMontoTransferencia: Locator

  constructor(page: Page) {
    this.page = page
    this.dashboardTitle = page.getByTestId('titulo-dashboard')
    this.botonAgregarCuenta = page.getByTestId('tarjeta-agregar-cuenta')
    this.botonEnviarDinero = page.getByTestId('boton-enviar')
    this.descripcionesListaTransferencias = page.getByTestId('descripcion-transaccion')
    this.montosListaTransferecnias = page.getByTestId('monto-transaccion')
    this.elementosListaMontoTransferencia = page.locator('[data-testid="monto-transaccion"]')
  }

  async visitarPaginaDashboard() {
    return await this.page.goto('http://localhost:3000/dashboard')
  }
}
