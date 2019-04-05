import { injectable } from 'inversify'
import { Response } from 'node-fetch'
import 'reflect-metadata'
import { RequestInitBase, RequestInitGet } from '../interface'
import { Http } from '../mode/cloud'
import { HttpError } from '../typings/http_error'

/**
 * Http json client.
 * @throws {HttpError}
 */
@injectable()
export class HttpJson {
  constructor(private http: Http) {}

  async get<T>(url: string, init?: RequestInitGet): Promise<T> {
    return await this.handle(this.http.get(url, init))
  }
  async post<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.post(url, init))
  }
  async put<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.put(url, init))
  }
  async delete<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.delete(url, init))
  }

  private async handle<T>(response: Promise<Response>): Promise<T> {
    const res = await response

    if (res.status !== 200) {
      throw {
        details: res,
        message: `Http error code ${res.status}: ${res.statusText}`,
      } as HttpError
    }

    return await res.json()
  }
}
