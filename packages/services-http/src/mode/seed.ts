import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { createResponse, Fixture } from '../seed/fixture'
import { HttpBase } from './base'

export interface RequestException {
  body: NodeJS.ReadableStream
  headers: Headers
  message: string
  status: number
}

/**
 * Http seed mode implementation.
 */
@injectable()
export class HttpSeed extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const seed = FixtureStorage.createByUrl<Fixture<any>>(
      url,
      init,
      this.testScope
    )

    try {
      const seedFixture = seed.get()
      if (!seed.expired) {
        // seed exists => return seed
        return createResponse(seedFixture)
      }
    } catch (e) {
      // ignore
    }
    const fixture = await this.fetchFixture(url, init)
    seed.set(fixture)
    return createResponse(fixture)
  }

  private async fetchFixture(url: string, init?: RequestInit) {
    const res = await fetch(url, init)
    const body = await this.parseBody(res)
    const { headers, status, statusText } = res
    const options = { headers, status, statusText, url }
    const fixture: Fixture<any> = { body, options }
    return fixture
  }

  private async parseBody(res: Response): Promise<object | string> {
    const body = await res.textConverted()
    let parsedBody

    try {
      parsedBody = JSON.parse(body) as object
    } catch (e) {
      // ignore
    }

    return parsedBody || body
  }
}
