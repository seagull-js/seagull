import { forwardRef, Inject, Injectable } from 'injection-js'
import { Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpError } from '.'
import { RequestInitBase, RequestInitGet } from '../http'
import { Http } from '../modes/cloud'

/**
 * Http json client.
 */
export class HttpJson {
  constructor(@Inject(forwardRef(() => Http)) private http: Http) {}

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
