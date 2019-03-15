import * as crypto from 'crypto'
import * as fs from 'fs'
import { outputJsonSync, pathExistsSync, readJsonSync } from 'fs-extra'
import { RequestInit } from 'node-fetch'
import { join } from 'path'
import { SeedLocalConfig } from './seedLocalConfig'

// tslint:disable-next-line:no-var-requires
require('ts-node')

/**
 * Seed storage for managing seed fixtures.
 */
export default class SeedStorage<T> {
  /**
   * Date the fixture has been created (in case a fixture exists).
   * @param uri Fixture uri
   */
  get createdDate(): Date | undefined {
    return pathExistsSync(this.path) ? fs.statSync(this.path).mtime : undefined
  }

  get expired(): boolean {
    const addDays = (date: Date, days?: number) => {
      if (typeof days !== 'number') {
        return undefined
      }
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }
    const seedDate = this.createdDate!
    const expireDate = addDays(seedDate, this.config.expiresInDays)
    return (expireDate && expireDate.getTime() <= new Date().getTime()) || false
  }

  /**
   * The seed configuration placed within the fixture folder.
   * @param uri
   */
  get config(): SeedLocalConfig<T> {
    const path = this.path + '.ts'
    const config = this.getConfigRecursive({}, path)
    // console.log('config is ' + JSON.stringify(config))
    return config
  }

  private get path() {
    return join('seed', this.uri)
  }

  /**
   * Alternate constructor to create a seed storage by request informations.
   * @param url The request url.
   * @param init The request configuration.
   */
  static createByRequest<T>(url: string, init?: RequestInit): SeedStorage<T> {
    url = url.replace('http://', 'http/')
    url = url.replace('https://', 'https/')
    return new SeedStorage(
      `${url}/${init ? this.hash(JSON.stringify(init)) : 'default'}.json`
    )
  }

  private static hash(key: string) {
    return crypto
      .createHash('md5')
      .update(key)
      .digest('hex')
  }

  /**
   * Creates a new seed storage for managing seed fixtures.
   * @param uri Fixture uri
   */
  constructor(public uri: string) {}

  /**
   * Get fixture.
   * @param uri Fixture uri
   */
  get(): T {
    return pathExistsSync(this.path) ? readJsonSync(this.path) : undefined
  }

  /**
   * Set fixture.
   * @param value Fixture value (response/file content)
   */
  set(value: T | string) {
    return outputJsonSync(this.path, value, { spaces: 2 })
  }

  private getConfigRecursive(
    config: SeedLocalConfig<T>,
    path: string
  ): SeedLocalConfig<T> {
    if (pathExistsSync(path)) {
      // node_modules/@seagull/commands-http/dist/src
      const seedFolder = `${__dirname}/${'../'.repeat(5)}`
      config = Object.assign(config, require(seedFolder + path).default)
    }
    if (path.indexOf('/') > -1) {
      return this.getConfigRecursive(
        config,
        path.substring(0, path.lastIndexOf('/')) + '.ts'
      )
    } else {
      return config
    }
  }
}
