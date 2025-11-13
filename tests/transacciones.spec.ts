import { test, expect } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage'
import { ModalEnviarTransferencia } from '../pages/modalEnviarTransferencia'
import TestData from '../data/testData.json'

let dashboardPage: DashboardPage
let modalEnviarTransferencia: ModalEnviarTransferencia

test.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page)
  modalEnviarTransferencia = new ModalEnviarTransferencia(page)
  await dashboardPage.visitarPaginaDashboard()
})
//Indicamos cual queremos que sea el estado inicial con el que queremos que comience el test
const testUsuarioEmisor = test.extend({
  storageState: require.resolve('../playwright/.auth/usuarioEmisor.json'),
})

const testUsuarioReceptor = test.extend({
  storageState: require.resolve('../playwright/.auth/usuarioReceptor.json'),
})

testUsuarioEmisor('Verificar transacción exitosa', async ({ page }) => {
  await expect(dashboardPage.dashboardTitle).toBeVisible()
  await dashboardPage.botonEnviarDinero.click()
  await modalEnviarTransferencia.completarFormulario(TestData.usuarioValido.email, '250')
  await modalEnviarTransferencia.botonEnviar.click()
  await expect(page.getByText(`Transferencia enviada a ${TestData.usuarioValido.email}`)).toBeVisible()
})

//Esto se puede mejorar sabiendo siempre el email del usuario receptor
testUsuarioReceptor('Verificar que usuario receptor recibe dinero', async ({ page }) => {
  await expect(dashboardPage.dashboardTitle).toBeVisible()
  await expect(page.getByText('Transferencia de seba1762868733887@mail.com')).toBeVisible()
})
