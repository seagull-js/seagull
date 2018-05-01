import * as dashify from 'dashify'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
import { ReadOnlyConfig } from '..'
import * as DB from './ddb'
import field from './field'

/**
 * Represents a Document in a NoSQL Document database (precisely: DynamoDB).
 * Currently it is not directly available in the browser, but must be accessed
 * from within API handlers exclusively.
 *
 * You can scale up your database tables by increasing the throughput attributes
 * as high as you want, but this can become costly if you're not conservative.
 * Nevertheless, it is possible to scale up as high as you want and you only pay
 * for throughput, not storage.
 *
 * The name of the database table is derived automatically from the class name,
 * properties and their types from typescript-types. The primary index field is
 * managed automatically for you, as well as default timestamp fields. The
 * @fields of your models are also typechecked at runtime for you when you try
 * to save objects into the database.
 */
export default class Model {
  /**
   * static attributes for table metadata and settings
   */

  // number of reads per second (records per 4KB)
  static readsPerSecond: number = 5

  // number of writes per second (records per 4kb)
  static writesPerSecond: number = 5

  /**
   * static methods for managing model objects ("CRUD")
   */

  // return a list of all objects in the database table
  static async all<T extends Model>(this: { new (): T }): Promise<T[]> {
    const data = await DB.scanItems(new this()._tableName)
    return data.map(item => Object.assign(new this(), item))
  }

  // remove ALL objects in the database table, returns number of removed items
  static async clear<T extends Model>(): Promise<number> {
    const all = await this.all()
    for (const item of all) {
      await item.remove()
    }
    return all.length
  }

  // directly create a new object from parameters, save it and then return it
  static async create<T extends Model>(this: { new (): T }, data): Promise<T> {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  // Fetch an object from the database by id
  static async find<T extends Model>(
    this: { new (): T },
    id: string
  ): Promise<T> {
    const data = await DB.getItem(new this()._tableName, 'id', id)
    if (data && data.id) {
      const instance: T = Object.assign(new this(), data)
      return instance
    } else {
      return undefined
    }
  }

  // Remove an object from the database by id
  static async remove<T extends Model>(id: string): Promise<boolean> {
    const instance = await this.find(id)
    return instance ? instance.remove() : false
  }

  // anything different than 0 activates dynamodbs ttl feature
  // autodeletes items after number in seconds
  expiresAfter: number = 0

  /**
   * private data fields that get auto-managed and persisted
   */

  // auto-managed field: when was this object created (unix timestamp)
  @field private createdAt: number = null

  // auto-managed field: primary key of the object (kind of uuid)
  @field private id: string = null

  // auto-managed field: when was this object updated last
  @field private updatedAt: number = null

  // auto-managed field: epoch in seconds of when to delete object
  @field private deleteAt: number = null

  /**
   * convenient read-only accessors for the private data fields
   */

  // safe read-only accessor for the primary key field
  get _id(): string {
    return this.id
  }

  // safe read-only accessor for the createdAt timestamp as a Date object
  get _createdAt(): Date {
    return this.createdAt ? new Date(this.createdAt) : null
  }

  // safe read-only accessor for the updatedAt timestamp as a Date object
  get _updatedAt(): Date {
    return this.updatedAt ? new Date(this.updatedAt) : null
  }

  // safe read-only accessor for the deleteAt timestamp as a Date object
  get _deleteAt(): Date {
    return this.deleteAt ? new Date(this.deleteAt * 1000) : null
  }

  /**
   * convenience helpers for metadata, typechecking and error handling
   */

  // helper for getting the model name for a given object
  get _name(): string {
    return dashify(this.constructor.name)
  }

  // helper for getting the table name for a given object
  get _tableName(): string {
    return `${ReadOnlyConfig.pkgName}-${dashify(this.constructor.name)}`
  }

  // advanced magic stuff to get the data fields of the object and its types (!)
  get _interface(): { [field: string]: string } {
    const result = {}
    for (const key of Object.keys(this)) {
      const type = Reflect.getMetadata('design:type', this, key)
      if (type && type.name) {
        result[key] = type.name.toLowerCase()
      }
    }
    return result
  }

  // field names of derived models
  get _ownFields(): string[] {
    const whitelist = new Model()
    return Object.keys(this._interface).filter(key => !(key in whitelist))
  }

  // check if fields have wrong data types and return a list of wrong ones
  get _errors(): string[] {
    const itf = this._interface
    return this._ownFields
      .map(key => (typeof this[key] !== itf[key] ? key : false))
      .filter(key => key) as string[]
  }

  // shorthand helper for existing type errors on runtime
  get _isValid(): boolean {
    return this._errors.length <= 0
  }

  /**
   * public instance methods for model objects
   */

  // remove the object from the database
  async remove(): Promise<boolean> {
    if (!this._id) {
      return false
    }
    return DB.removeItem(this._tableName, 'id', this._id)
  }

  // persist an object to the database, creating a new record or update existing
  async save(): Promise<this> {
    if (!this._isValid) {
      const fields = this._errors.join(', ')
      throw new Error(`invalid fields for ${this._name}: ${fields}`)
    }
    if (!this.id) {
      this.id = newID()
    }
    const now = new Date().getTime()
    const nowSeconds = Math.floor(now / 1000)
    this.deleteAt =
      this.expiresAfter > 0 ? nowSeconds + this.expiresAfter : null
    this.createdAt = !this.createdAt ? now : this.createdAt
    this.updatedAt = now
    await DB.putItem(this._tableName, this)
    return this
  }
}
