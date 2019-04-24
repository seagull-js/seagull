import { injectable } from 'inversify'
import { Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpError } from '../error'
import { RequestInitBase, RequestInitGet } from '../interface'
import { Http } from '../mode/cloud'

/**
 * Http json client.
 * @throws {HttpError}
 */
@injectable()
export class HttpJson {
  constructor(private http: Http) {}

  /**
   * HTTP GET request
   * @param url request url
   * @param init whatwg/fetch options
   */
  async get<T>(url: string, init?: RequestInitGet): Promise<T> {
    return await this.handle(this.http.get(url, init))
  }

  /**
   * HTTP POST request
   * @param url request url
   * @param init whatwg/fetch options
   */
  async post<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.post(url, init))
  }

  /**
   * HTTP PUT request
   * @param url request url
   * @param init whatwg/fetch options
   */
  async put<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.put(url, init))
  }

  /**
   * HTTP DELETE request
   * @param url request url
   * @param init whatwg/fetch options
   */
  async delete<T>(url: string, init?: RequestInitBase): Promise<T> {
    return await this.handle(this.http.delete(url, init))
  }

  private async handle<T>(response: Promise<Response>): Promise<T> {
    const res = await response

    if (res.status !== 200) {
      throw new HttpError(
        `Http error code ${res.status}: ${res.statusText}`,
        res
      )
    }

    return await res.json()
  }
}
