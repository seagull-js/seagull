import * as dashify from 'dashify'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
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

  // directly create a new object from parameters, save it and then return it
  static async create<T extends Model>(this: { new (): T }, data): Promise<T> {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  // Fetch an object from the database by id
  static async find<T extends Model>(this: { new (): T }, id: string): Promise<T> {
    const data = await DB.getItem(new this()._name, 'id', id)
    const instance: T = Object.assign(new this(), data)
    return instance
  }

  /**
   * private data fields that get auto-managed and persisted
   */

  // auto-managed field: when was this object created (unix timestamp)
  @field private createdAt: number = null

  // auto-managed field: primary key of the object (kind of uuid)
  @field private id: string = null

  // auto-managed field: when was this object updated last
  @field private updatedAt: number = null

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

  /**
   * convenience helpers for metadata, typechecking and error handling
   */

  // helper for getting the model name for a given object
  get _name(): string {
    return dashify(this.constructor.name)
  }

  // advanced magic stuff to get the data fields of the object and its types (!)
  get _interface(): {[field: string]: string} {
    const result = {}
    for (const key of Object.keys(this)) {
      const type = Reflect.getMetadata('design:type', this, key)
      if (type && type.name) {
        result[key] = type.name.toLowerCase()
      }
    }
    return result
  }

  // check if fields have wrong data types and return a list of wrong ones
  get _errors(): string[] {
    const itf = this._interface
    return Object.keys(itf).map(key => {
      if (key === 'id' || key === 'updatedAt' || key === 'createdAt') {
        return false
      }
      return typeof this[key] !== itf[key] ? key : false
    }).filter(key => key) as string[]
  }

  // shorthand helper for existing type errors on runtime
  get _isValid(): boolean {
    return this._errors.length <= 0
  }

  /**
   * public instance methods for model objects
   */

  // persist an object to the database, creating a new record or update existing
  async save(): Promise<this> {
    if (!this._isValid) {
      const fields = this._errors.join(', ')
      throw new Error(`invalid fields for ${this._name}: ${fields}`)
    }
    if (!this.id) {
      this.id = newID()
    }
    if (!this.createdAt) {
      this.createdAt = new Date().getTime()
    }
    this.updatedAt = new Date().getTime()
    await DB.putItem(this._name, this)
    return this
  }
}
