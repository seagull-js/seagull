import { Command } from '@seagull/commands'
import nodefetch, {
  Request as NodeRequest,
  RequestInit,
  Response,
} from 'node-fetch'
import { Http, RequestConfig } from './index'
import SeedStorage from './seedStorage'

export interface RequestException {
  body: NodeJS.ReadableStream
  headers: Headers
  message: string
  status: number
}

export const fetchPureSeed = false

/**
 * Http request command.
 */
export class Request<T> extends Command<T> {
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  private seed: SeedStorage<T>
  private fetch: (
    url: string | NodeRequest,
    init?: RequestInit | undefined
  ) => Promise<Response>

  /**
   * Creates an http request command.
   * @param config Http request command configuration.
   */
  constructor(
    public config: RequestConfig,
    fetch = nodefetch as (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response>
  ) {
    super()
    if (!config) {
      throw new Error('HttpCommand: You have to specify a config!')
    }
    if (!this.config.url) {
      throw new Error('HttpCommand: The url in the config is not specified!')
    }
    this.config = config
    this.seed = SeedStorage.createByRequest(config.url, config.init)
    this.fetch = fetch
  }

  async executeCloud(): Promise<T> {
    const response = await this.fetch(this.config.url, this.config.init)
    let body
    switch (this.config.parseBody) {
      case 'xml':
        throw new Error('not implemented')
      case 'text':
        body = (await response.textConverted()) as any
        break
      case 'base64':
        body = (await response.buffer()).toString('base64') as any
        break
      case 'json':
      default:
        body = await response.json()
    }
    if (response.status === 200) {
      return body
    } else {
      throw response as Response
    }
  }

  async executePure(): Promise<T> {
    const seedLocalHookConfig = this.seed.config
    const seed = this.seed.get() as T
    if (seed) {
      const addDays = (date: Date, days?: number) => {
        if (typeof days !== 'number') {
          return undefined
        }
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
      }
      const seedDate = this.seed.createdDate!
      const expireDate = addDays(seedDate, seedLocalHookConfig.expiresInDays)
      const isExpired =
        expireDate && expireDate.getTime() <= new Date().getTime()
      if (!isExpired) {
        return seed
      }
    }
    if (Http.fetchPureSeed) {
      console.info('HttpCommand: fetching fixture (seed) for ' + this.seed.uri)
      let fixture = await this.executeCloud()
      if (seedLocalHookConfig.hook) {
        fixture = seedLocalHookConfig.hook(fixture)
      } else if (Http.seedGlobalHookScript) {
        fixture = Http.seedGlobalHookScript<T>(fixture) || fixture
      }
      this.seed.set(fixture)
      return fixture
    }
    throw new Error('HttpCommand: fixture (seed) is missing.')
  }

  /**
   * Executes the http request command
   * @throws {Error} Other errors
   * @throws {RequestException} Http non-200 response status
   */
  execute(): Promise<T> {
    return this.executeHandler()
  }

  revert(): Promise<T> {
    return undefined as any
  }
}
