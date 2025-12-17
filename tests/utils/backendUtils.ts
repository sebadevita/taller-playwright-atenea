import { APIRequestContext, expect } from '@playwright/test'

export class BackendUtils {
  readonly request: APIRequestContext
  readonly endpoint: string

  constructor(request: APIRequestContext) {
    this.request = request
  }

  async crearUsuarioAPI(endpoint: string, usuario: { nombre: string; apellido: string; email: string; password: string }, esNuevo: boolean = true) {
    let email: string

    if (esNuevo) {
      email = 'seba' + Date.now().toString() + '@mail.com'
    } else {
      email = usuario.email
    }

    const response = await this.request.post(endpoint, {
      data: {
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: email,
        password: usuario.password,
      },
    })

    return { email: email, password: usuario.password }
  }
}
