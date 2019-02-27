import { Command } from '@seagull/commands'
import fetch, { Response as FetchResponse } from 'node-fetch'
import { Http, RequestConfig } from './index'
import SeedStorage from './seedStorage'

/**
 * Http request command.
 */
export class Request<T> extends Command<T> {
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  private seed: SeedStorage<T>

  /**
   * Creates an http request command.
   * @param config Http request command configuration.
   */
  constructor(public config: RequestConfig) {
    super()
    if (!config) {
      throw new Error('HttpCommand: You have to specify a config!')
    }
    if (!this.config.url) {
      throw new Error('HttpCommand: The url in the config is not specified!')
    }
    this.config = config
    this.seed = SeedStorage.createByRequest(config.url, config.init)
  }

  async executeCloud(): Promise<T> {
    const response = await fetch(this.config.url, this.config.init)
    switch (this.config.parseBody) {
      case 'xml':
        throw new Error('not implemented')
      case 'text':
        return (await response.text()) as any
      case 'json':
      default:
        return await response.json()
    }
  }

  async executePure(): Promise<T> {
    const seedLocalHookConfig = this.seed.config
    const seed = this.seed.get() as T
    if (seed) {
      const addDays = (date: Date, days?: number) => {
        if (typeof days !== 'number') { return undefined }
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

  execute(): Promise<T> {
    return this.executeHandler()
  }

  revert(): Promise<T> {
    return undefined as any
  }
}
