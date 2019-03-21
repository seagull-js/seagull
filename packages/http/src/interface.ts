import { Omit } from 'lodash'
import { RequestInit, Response } from 'node-fetch'

export type RequestInitBase = Omit<RequestInit, 'method'>
export type RequestInitGet = Omit<RequestInit, 'method' | 'body'>

/**
 * Http interface.
 */
export interface IHttp {
  fetch: (url: string, init?: RequestInit) => Promise<Response>

  // some convenience ...
  get: (url: string, init?: RequestInitGet) => Promise<Response>
  post: (url: string, init?: RequestInitBase) => Promise<Response>
  put: (url: string, init?: RequestInitBase) => Promise<Response>
  delete: (url: string, init?: RequestInitBase) => Promise<Response>
}
