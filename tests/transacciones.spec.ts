import { test, expect } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage'
import { ModalEnviarTransferencia } from '../pages/modalEnviarTransferencia'
import TestData from '../data/testData.json'
import fs from 'fs/promises'

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
  console.log('Seba capo')
  await modalEnviarTransferencia.completarFormulario(TestData.usuarioValido.email, '250')
  await expect(modalEnviarTransferencia.cuentaOrigenDropdown).toBeVisible()
  await expect(modalEnviarTransferencia.cuentaOrigenOption).toBeVisible()
  await modalEnviarTransferencia.botonEnviar.click()
  await expect(page.getByText(`Transferencia enviada a ${TestData.usuarioValido.email}`)).toBeVisible()
})

//Esto se puede mejorar sabiendo siempre el email del usuario receptor
testUsuarioReceptor('Verificar que usuario receptor recibe dinero', async ({ page }) => {
  await expect(dashboardPage.dashboardTitle).toBeVisible()
  await expect(page.getByText('Transferencia de seba1762868733887@mail.com')).toBeVisible()
})

//Test unficiado de enviar dinero por API y verifica en el Front

testUsuarioReceptor('Verificar transferencia recibida (Enviada por API)', async ({ page, request }) => {
  //Preparar el token
  //Vamos a buscar el archivo donde tenemos el usuario
  const usuarioEmisorDataFile = require.resolve('../playwright/.auth/usuarioEmisor.data.json')

  //Leemos el archivo y lo guardamos
  const usuarioEmisorData = await fs.readFile(usuarioEmisorDataFile, 'utf-8')

  //Transformamos al usuario en objeto json
  const usuarioEmisor = JSON.parse(usuarioEmisorData)

  const emailUsuarioEmisor = usuarioEmisor.email

  expect(emailUsuarioEmisor).toBeDefined()

  //Leemos el archivo de autenticación del emisor para obtener el jwt

  const usuarioEmisorAuthFile = require.resolve('../playwright/.auth/usuarioEmisor.json')
  const usuarioEmisorAuth = await fs.readFile(usuarioEmisorAuthFile, 'utf-8')
  const usuarioEmisorAuthJson = JSON.parse(usuarioEmisorAuth)

  //Los signos de '?' es para que no se rompa si es undefined algún valor
  const jwtUsuarioEmisor = usuarioEmisorAuthJson.origins[0]?.localStorage.find((item) => item.name === 'jwt')?.value

  //Obtener cuenta del emisor para saber el id de la cuenta

  const responseCuenta = await request.get('http://localhost:6007/api/accounts', {
    headers: {
      Authorization: `Bearer ${jwtUsuarioEmisor}`,
    },
  })

  expect(responseCuenta.ok(), `La API de obtener cuenta falló: ${responseCuenta.status()}`).toBeTruthy()
  const cuentas = await responseCuenta.json()
  expect(cuentas.length, 'No se encontraron cuentas para el usuario').toBeGreaterThan(0)
  const idCuentaOrigen = cuentas[0]._id

  const montoAleatorio = Math.floor(Math.random() * 100) + 1
  //Enviamos la transferencia por API

  const responseTransferencia = await request.post('http://localhost:6007/api/transactions/transfer', {
    headers: {
      Authorization: `Bearer ${jwtUsuarioEmisor}`,
    },
    data: {
      fromAccountId: idCuentaOrigen,
      toEmail: TestData.usuarioValido.email,
      amount: montoAleatorio,
    },
  })

  expect(responseTransferencia.ok(), 'La API de transferencia falló' + responseTransferencia.status()).toBeTruthy()

  //Comprobar que el monto enviado llegó al destintario por UI

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(dashboardPage.dashboardTitle).toBeVisible()

  await expect(dashboardPage.descripcionesListaTransferencias.first()).toContainText(emailUsuarioEmisor)
  await expect(dashboardPage.montosListaTransferecnias.first()).toContainText(`${montoAleatorio}`)
})
