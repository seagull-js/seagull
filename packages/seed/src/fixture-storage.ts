import * as crypto from 'crypto'
import * as fs from 'fs'
import {
  outputFileSync,
  outputJsonSync,
  pathExistsSync,
  readFileSync,
  readJsonSync,
} from 'fs-extra'
import { join } from 'path'
import { SeedError } from './error'
import { LocalConfig } from './local-config'
import { TestScope } from './test-scope'

// tslint:disable-next-line:no-var-requires
require('ts-node')

type FixtureFileExtension = '.json' | '.xml' | '.wsdl'
type FsHandler = {
  read: (path: string, ...params: any[]) => Buffer
  save: (path: string, ...params: any[]) => void
}

/**
 * Seed fixture storage for managing seed fixtures.
 */
export class FixtureStorage<T> {
  /**
   * Date of the last modification of the fixture.
   * @param uri Fixture uri
   */
  get modifiedDate(): Date | undefined {
    return pathExistsSync(this.path) ? fs.statSync(this.path).ctime : undefined
  }

  /**
   * The seed fixture is expired. See the seed `config` for details.
   */
  get expired(): boolean {
    if (this.config.expiresInDays === undefined || !this.modifiedDate) {
      return false
    }
    const addDays = (date: Date, days?: number) => {
      if (typeof days !== 'number') {
        return undefined
      }
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }

    const expireDate = addDays(this.modifiedDate, this.config.expiresInDays)
    return (expireDate && expireDate.getTime() <= new Date().getTime()) || false
  }

  /**
   * The seed fixture exists and is loadable.
   */
  get exists(): boolean {
    return pathExistsSync(this.path)
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

  /**
   * The local uri of the fixture.
   */
  get uriLocal(): string {
    return `${process.cwd()}/${this.path}`
  }

  get path() {
    const scopedPath = `${this.uri}${this.testScope ? this.testScope.path : ''}`
    const path = join('seed', `${scopedPath}${this.fileExtension || ''}`)
    return path
  }

  /**
   * Creates a new fixture storage by url and request information.
   * @param url The request url.
   * @param init The request configuration.
   */
  static createByUrl<T>(
    url: string,
    params?: any,
    testScope?: TestScope
  ): FixtureStorage<T> {
    const path = url.replace('://', '/')
    const uri = `${path}/${
      params ? this.hash(JSON.stringify(params)) : 'default'
    }`
    const fileExtension = `.json`
    return new FixtureStorage(uri, fileExtension, testScope)
  }

  /**
   * Creates a new seed fixtureStorage by wsdl url.
   * @param url The request url.
   */
  static createByWsdlUrl<T>(url: string): FixtureStorage<T> {
    url = url.replace('://', '/')
    url = url.replace('?wsdl', '')
    return new FixtureStorage(`${url.replace('://', '/')}`, `.wsdl`)
  }

  private static hash(key: string) {
    return crypto
      .createHash('md5')
      .update(key)
      .digest('hex')
  }

  /**
   * Creates a new seed fixture storage for managing seed fixtures.
   * @param uri Fixture uri
   */
  constructor(
    /** The uri of the origin of the fixture. */
    readonly uri: string,
    /** The file extendsion for the local fixture. */
    readonly fileExtension: FixtureFileExtension,
    /**
     * The test scope of the fixture.\
     * If a test scope is used, the fixture will be created within folders named
     * by test suite and test name. The callIndex will automatically count up by
     * 1 when the `get` function is called. This can be used to identify a
     * specific call in case calls are stateful.
     */
    readonly testScope?: TestScope
  ) {}

  /**
   * Get fixture.
   * @param uri Fixture uri
   */
  get(): T {
    const fixture = this.exists && this.fs.read(this.path)
    if (!fixture) {
      throw new SeedError(`Fixture (seed) is missing: ${this.path}.`, this)
    }
    if (this.expired) {
      throw new SeedError(`Fixture (seed) is expired: ${this.path}.`, this)
    }
    if (this.testScope) {
      this.testScope.callIndex += 1
    }
    return fixture
  }

  /**
   * Set fixture.
   * @param value Fixture value (response/file content)
   */
  set(value: T) {
    if (this.config.hook) {
      value = this.config.hook(value)
    }
    this.fs.save(this.path, value)
    if (this.testScope) {
      this.testScope.callIndex += 1
    }
  }

  private get fsJson() {
    const jsonOpts = { spaces: 2 }
    const save = (path: string, val: any) => outputJsonSync(path, val, jsonOpts)
    return { read: readJsonSync, save }
  }

  private get fsXml() {
    return { save: outputFileSync, read: readFileSync }
  }

  private get fs() {
    const fileFormatFs = new Map<FixtureFileExtension, FsHandler>([
      ['.json', this.fsJson],
      ['.wsdl', this.fsXml],
      ['.xml', this.fsXml],
    ])
    return fileFormatFs.get(this.fileExtension) || this.fsJson
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
        const seedFolder = `${process.cwd()}/`
        config = Object.assign(config, require(seedFolder + tsPath).default)
      }
      return parentConfig
    } else {
      return config
    }
  }
}
