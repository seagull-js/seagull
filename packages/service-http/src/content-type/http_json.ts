import { injectable } from 'inversify'
import { Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpError } from '.'
import { RequestInitBase, RequestInitGet } from '../interface'
import { Http } from '../mode/cloud'

/**
 * Http json client.
 * @throws {HttpError}
 */
@injectable()
export class HttpJson {
  constructor(private http: Http) {}

  async get<T>(url: string, init?: RequestInitGet): Promise<T> {
    return this.handle(this.http.get(url, init))
  }
  async post<T>(url: string, init?: RequestInitBase): Promise<T> {
    return (await this.http.post(url, init)).json()
  }
  async put<T>(url: string, init?: RequestInitBase): Promise<T> {
    return (await this.http.put(url, init)).json()
  }
  async delete<T>(url: string, init?: RequestInitBase): Promise<T> {
    return (await this.http.delete(url, init)).json()
  }

  private async handle<T>(response: Promise<Response>): Promise<T> {
    const res = await response

    if (res.status !== 200) {
      throw Object.assign(res, {
        message: `Http error code ${res.status}: ${res.statusText}`,
      }) as HttpError
    }

    return await res.json()
  }
}
