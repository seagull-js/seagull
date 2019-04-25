import * as crypto from 'crypto'
import * as fs from 'fs'
import { outputJsonSync, pathExistsSync, readJsonSync } from 'fs-extra'
import { RequestInit } from 'node-fetch'
import { join } from 'path'
import { SeedError } from './error'
import { LocalConfig } from './localConfig'

// tslint:disable-next-line:no-var-requires
require('ts-node')

/**
 * Seed fixtureStorage for managing seed fixtures.
 */
export class FixtureStorage<T> {
  /**
   * Date the fixture has been modified for the last time.
   * @param uri Fixture uri
   */
  get modifiedDate(): Date | undefined {
    return pathExistsSync(this.path) ? fs.statSync(this.path).ctime : undefined
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
    const modifiedDate = this.modifiedDate!
    const expireDate = addDays(modifiedDate, this.config.expiresInDays)
    return (expireDate && expireDate.getTime() <= new Date().getTime()) || false
  }

  /**
   * The seed configuration placed within the fixture folder.
   * @param uri
   */
  get config(): LocalConfig<T> {
    let path = this.path
    if (this.fileExtension) {
      path = path.replace(this.fileExtension, '')
    }
    const config = this.getConfigRecursive({}, path)
    return config
  }

  private get path() {
    return join('seed', this.uri + (this.fileExtension || ''))
  }

  /**
   * Alternate constructor to create a seed fixtureStorage by request informations.
   * @param url The request url.
   * @param init The request configuration.
   */
  static createByFetchParams<T>(
    url: string,
    init?: RequestInit
  ): FixtureStorage<T> {
    url = url.replace('http://', 'http/')
    url = url.replace('https://', 'https/')
    return new FixtureStorage(
      `${url}/${init ? this.hash(JSON.stringify(init)) : 'default'}`,
      `.json`
    )
  }

  private static hash(key: string) {
    return crypto
      .createHash('md5')
      .update(key)
      .digest('hex')
  }

  /**
   * Creates a new seed fixtureStorage for managing seed fixtures.
   * @param uri Fixture uri
   */
  constructor(public uri: string, public fileExtension?: string) {}

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
    config: LocalConfig<T>,
    path: string
  ): LocalConfig<T> {
    const tsPath = path + '.ts'

    if (path.indexOf('/') > -1) {
      const parentConfig = this.getConfigRecursive(
        config,
        path.substring(0, path.lastIndexOf('/'))
      )
      if (pathExistsSync(tsPath)) {
        // node_modules/@seagull/services-http/dist/src/seed
        const seedFolder = `${process.cwd()}/` // `${__dirname}/${'../'.repeat(6)}`
        config = Object.assign(config, require(seedFolder + tsPath).default)
      }
      return parentConfig
    } else {
      return config
    }
  }
}
