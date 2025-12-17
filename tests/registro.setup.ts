import { ModalCrearCuenta } from './../pages/modalCrearCuenta'
import { DashboardPage } from './../pages/dashboardPage'
import { test as setup, expect } from '@playwright/test'
import { BackendUtils } from './utils/backendUtils'
import { LoginPage } from '../pages/loginPage'
import TestData from '../data/testData.json'
import fs from 'fs/promises'
import path from 'path'

let loginPage: LoginPage
let dashboardPage: DashboardPage
let modalCrearCuenta: ModalCrearCuenta

const usuarioEmisorAuthFile = 'playwright/.auth/usuarioEmisor.json'
const usuarioReceptorAuthFile = 'playwright/.auth/usuarioReceptor.json'
const usuarioEmisorDataFile = 'playwright/.auth/usuarioEmisor.data.json'

setup.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  dashboardPage = new DashboardPage(page)
  modalCrearCuenta = new ModalCrearCuenta(page)
  await loginPage.visitarPaginaLogin()
})

setup('Generar usuario que envia dinero', async ({ page, request }) => {
  const userAPI = new BackendUtils(request)
  console.log('SE EJECUTA SETUP SE EJECUTA SETUP SE EJECUTA SETUP')
  const endpoint = 'http://localhost:6007/api/auth/signup'
  const nuevoUsuario = await userAPI.crearUsuarioAPI(endpoint, TestData.usuarioValido)

  //Guardamos los datos del nuevo usuario para tests de Transacciones en un archivo
  //Primero se indica la ruta donde queremos guardar el archivo, luego que data queremos guardar

  await fs.writeFile(path.resolve(__dirname, '..', usuarioEmisorDataFile), JSON.stringify(nuevoUsuario, null, 2))

  await loginPage.completarFormularioLogin(nuevoUsuario)
  await loginPage.clickLogin()
  await dashboardPage.botonAgregarCuenta.click()
  await modalCrearCuenta.seleccionarTipoDeCuenta('Débito')
  await modalCrearCuenta.completarMonto('1000')
  await modalCrearCuenta.botonCrearCuenta.click()
  await expect(page.getByText('Cuenta creada exitosamente')).toBeVisible()

  //Guarda las cookies del usuario en el path indicado
  await page.context().storageState({ path: usuarioEmisorAuthFile })
})

setup('Crear y loguearse con usuario que recibe dinero', async ({ page, request }) => {
  const userAPI = new BackendUtils(request)
  const endpoint = 'http://localhost:6007/api/auth/signup'
  const nuevoUsuario = await userAPI.crearUsuarioAPI(endpoint, TestData.usuarioValido, false)
  await loginPage.completarFormularioLogin(nuevoUsuario)
  await loginPage.clickLogin()
  await expect(dashboardPage.dashboardTitle).toBeVisible()

  // Crear cuenta bancaria para el usuario receptor
  // Esto es necesario para que pueda recibir transferencias correctamente
  await dashboardPage.botonAgregarCuenta.click()
  await modalCrearCuenta.seleccionarTipoDeCuenta('Débito')
  await modalCrearCuenta.completarMonto('500')
  await modalCrearCuenta.botonCrearCuenta.click()
  await expect(page.getByText('Cuenta creada exitosamente')).toBeVisible()

  await page.context().storageState({ path: usuarioReceptorAuthFile })
})
