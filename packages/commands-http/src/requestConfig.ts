import { RequestInit } from 'node-fetch'

export type ParseBodyType = 'json' | 'xml' | 'text' | 'base64'

/**
 * Http request command configuration.
 */
export interface RequestConfig {
  /**
   * Request url.
   */
  url: string
  /**
   * Request configuration (@see {@link https://github.com/bitinn/node-fetch#options})
   */
  init?: RequestInit
  /**
   * Returned body is parsed as 'json' (default), 'xml', 'text' (not parsed).
   */
  parseBody?: ParseBodyType
}
