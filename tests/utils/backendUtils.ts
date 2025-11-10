import { APIRequestContext, expect } from '@playwright/test'

export class BackendUtils {
  readonly request: APIRequestContext
  readonly endpoint: string

  constructor(request: APIRequestContext) {
    this.request = request
  }

  async crearUsuarioAPI(endpoint: string, usuario: { nombre: string; apellido: string; email: string; password: string }) {
    const email = 'seba' + Date.now().toString() + '@mail.com'

    const response = await this.request.post(endpoint, {
      data: {
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: email,
        password: usuario.password,
      },
    })

    return response
  }
}
