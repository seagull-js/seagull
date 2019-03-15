import { Omit } from 'lodash'
import { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { Http } from '..'

export type RequestInitBase = Omit<RequestInit, 'method'>
export type RequestInitGet = Omit<RequestInit, 'method' | 'body'>

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
