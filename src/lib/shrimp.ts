// external libraries
import { PackageJson } from '@seagull/package-config'
import { SimpleDB } from 'aws-sdk'
import * as dashify from 'dashify'
import { fromPairs, isArray, pick } from 'lodash'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
import { Memoize } from 'typescript-memoize'

// tslint:disable-next-line:no-empty
export const field = (target: any, key: string) => {}

// prepare database client
process.env.config_mock = JSON.stringify({ name: 'myapp', seagull: {} })
const pkg = new PackageJson()
const region = pkg.config.region

// actual model class
export class Shrimp {
  /**
   * static methods for managing model objects ("CRUD")
   */

  // return a list of all objects in the database table
  static async all<T extends Shrimp>(this: { new (): T }): Promise<T[]> {
    const DomainName = `${pkg.name}-${new this()._name}`
    const SelectExpression = `select * from '${DomainName}'`
    const data = await new SimpleDB({ region })
      .select({ SelectExpression })
      .promise()
    const items = data.Items.map(item =>
      Object.assign(
        new this(),
        /**
         * TODO: cast fields to number, string[], boolean, ...
         */
        { id: item.Name },
        fromPairs(item.Attributes.map(({ Name, Value }) => [Name, Value]))
      )
    )
    return items as T[]
  }

  // remove ALL objects in the database table, returns number of removed items
  static async clear<T extends Shrimp>(): Promise<number> {
    const all = await this.all()
    for (const item of all) {
      await item.remove()
    }
    return all.length
  }

  // directly create a new object from parameters, save it and then return it
  static async create<T extends Shrimp>(this: { new (): T }, data): Promise<T> {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  // Fetch an object from the database by id
  static async find<T extends Shrimp>(
    this: { new (): T },
    id: string
  ): Promise<T> {
    const DomainName = `${pkg.name}-${new this()._name}`
    const data = await new SimpleDB({ region })
      .getAttributes({ DomainName, ItemName: id })
      .promise()
    if (data && data.Attributes) {
      const attrs = data.Attributes
      const props = fromPairs(attrs.map(({ Name, Value }) => [Name, Value]))
      const instance: T = Object.assign(new this(), { id }, props)
      return instance
    } else {
      return undefined
    }
  }

  // Remove an object from the database by id
  static async remove<T extends Shrimp>(id: string): Promise<boolean> {
    const instance = await this.find(id)
    return instance ? instance.remove() : false
  }

  // transform all model fields into a SimpleDB AttributeList
  static _serialize<T extends Shrimp>(instance: T) {
    const list: SimpleDB.AttributeList = []
    const push = (Name, Value) => list.push({ Name, Value: Value.toString() })
    const keys = Object.keys(instance._interface)
    const pairs = keys.map(key => [key, instance[key]])
    pairs.forEach(([Name, Value]) => {
      isArray(Value) ? Value.forEach(v => push(Name, v)) : push(Name, Value)
    })
    return list
  }

  // transform a SimpleDB AttributeList back into model fields
  static _deserialize<T extends Shrimp>(
    this: new () => T,
    attrs: SimpleDB.AttributeList
  ): T {
    const instance: T = new this()
    attrs.forEach(({ Name, Value }) => {
      switch (instance._interface[Name]) {
        case 'boolean': {
          instance[Name] = Value === 'true'
          break
        }
        case 'boolean[]': {
          const value = Value === 'true'
          instance[Name]
            ? instance[Name].push(value)
            : (instance[Name] = [value])
          break
        }
        case 'number': {
          instance[Name] = parseFloat(Value)
          break
        }
        case 'number[]': {
          const value = parseFloat(Value)
          instance[Name]
            ? instance[Name].push(value)
            : (instance[Name] = [value])
          break
        }
        case 'string': {
          instance[Name] = Value
          break
        }
        case 'string[]': {
          instance[Name]
            ? instance[Name].push(Value)
            : (instance[Name] = [Value])
          break
        }
        default: {
          instance[Name] = Value
        }
      }
    })
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
  @Memoize()
  get _name(): string {
    return dashify(this.constructor.name)
  }

  // advanced magic stuff to get the data fields of the object and its types (!)
  @Memoize()
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
  @Memoize()
  get _ownFields(): string[] {
    const whitelist = new Shrimp()
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
    const DomainName = `${pkg.name}-${this._name}`
    await new SimpleDB({ region })
      .deleteAttributes({ DomainName, ItemName: this._id })
      .promise()
    return true
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
    if (!this.createdAt) {
      this.createdAt = new Date().getTime()
    }
    this.updatedAt = new Date().getTime()
    const DomainName = `${pkg.name}-${this._name}`
    const ItemName = this._id
    const attrs = Shrimp._serialize(this)
    await new SimpleDB({ region })
      .putAttributes({
        Attributes: attrs,
        DomainName,
        ItemName,
      })
      .promise()
    return this
  }
}
