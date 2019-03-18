import { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { RequestInitBase, RequestInitGet } from './http'
import { Http } from './modes/cloud'

export abstract class HttpBase implements Http {
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
