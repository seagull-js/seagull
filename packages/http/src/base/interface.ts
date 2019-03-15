import { RequestInitBase, RequestInitGet } from '.'

/**
 * Http interface.
 */
export interface Http {
  fetch: (url: string, init?: RequestInit) => Promise<Response>

  // some convenience ...
  get: (url: string, init?: RequestInitGet) => Promise<Response>
  post: (url: string, init?: RequestInitBase) => Promise<Response>
  put: (url: string, init?: RequestInitBase) => Promise<Response>
  delete: (url: string, init?: RequestInitBase) => Promise<Response>
}
