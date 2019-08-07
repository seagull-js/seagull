import { SeedableService } from '@seagull/seed'
import { injectable } from 'inversify'
import { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { IHttp, RequestInitBase, RequestInitGet } from '../interface'

/**
 * Http (default) base implementation.
 */
@injectable()
export abstract class HttpBase extends SeedableService implements IHttp {
  abstract fetch(url: string, init?: RequestInit | undefined): Promise<Response>

  async get(url: string, init?: RequestInitGet): Promise<Response> {
    return this.fetch(url, init)
  }

  async put(url: string, init?: RequestInitBase): Promise<Response> {
    return this.fetch(
      url,
      Object.assign(init || {}, {
        method: 'PUT',
      })
    )
  }

  async post(url: string, init?: RequestInitBase): Promise<Response> {
    return this.fetch(
      url,
      Object.assign(init || {}, {
        method: 'POST',
      })
    )
  }

  async delete(url: string, init?: RequestInitBase): Promise<Response> {
    return this.fetch(
      url,
      Object.assign(init || {}, {
        method: 'DELETE',
      })
    )
  }
}
