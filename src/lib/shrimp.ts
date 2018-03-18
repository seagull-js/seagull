// external libraries
import { PackageJson } from '@seagull/package-config'
import { SimpleDB } from 'aws-sdk'
import { find, fromPairs, isArray, pick } from 'lodash'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
import { Memoize } from 'typescript-memoize'
import field from './model/field'
import { Domain } from 'domain'

// usage guide:
// https://code.tutsplus.com/tutorials/building-a-rest-api-with-aws-simpledb-and-nodejs--cms-26086

// prepare database client
const pkg = new PackageJson()
const region = pkg.config.region

/**
 * Polymorphic `this` type
 */
export interface ISelf<T> {
  new (): T
}

/**
 * ## Shrimps: Small Data Models
 * Seagulls can feed from various sources, big and small. The Seagull Framework
 * adopts this mindset by providing different possibilities of data storage
 * with zero configuration. In this case, the small but robust shrimps stand
 * as an abstraction for [AWS SimpleDB](https://aws.amazon.com/de/simpledb/).
 *
 * ### When to use Shrimps
 * You have lots of small objects where each individual property is smaller than
 * 1KB and your total database will never exceed 10GB.
 * Also, you only need basic property types (`string`, `number`, `boolean`) or
 * arrays of them (`string[]`, `number[]`, `boolean[]`).
 * The distinct advantages are automatic indexing of __all__ properties and you
 * will only pay for computation time on your data operations instead of fixed
 * amounts of money for provisioning things (servers, indexes, ...).
 * The imposed limits from AWS SimpleDB are documented
 * [here](https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/SDBLimits.html).
 *
 * ### How to use Shrimps
 * Just subclass the `Shrimp` class and fill in your data properties and you
 * can perform typical CRUD operations instantly:
 *
 * ```typescript
 * import { field, Shrimp } from '@seagull/core'
 *
 * class Todo extends Shrimp {
 *   @field text: string = ''
 *   @field done: boolean = false
 * }
 *
 * // example: create a Todo shrimp
 * const todo = new Todo()
 * todo.text = 'buy milk'
 * todo.done = false
 * await todo.save()
 * ```
 *
 * ### Automatic Meta fields
 * Shrimps are automatically managed for you when it comes to typical metadata
 * fields: `id`, `createdAt` and `updatedAt`. These fields are updated every
 * time you do a persisting operation (like `save()`) and can be accessed via
 * dedicated getters.
 *
 * ### Open issues:
 *
 * - Currently the paginations for `select` queries are not implemented
 */
export class Shrimp {
  /**
   * Get an array of ALL shrimp items in the database. The `this` argument is
   * just virtual and pre-filled from typescript with your Shrimp Subclass.
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function getAllTodos() {
   *   const todos = await Todo.All()
   *   return todos
   * }
   * ```
   * @param this prefilled by typescript, skip this param!
   */
  static async All<T extends Shrimp>(this: ISelf<T>): Promise<T[]> {
    const DB = new SimpleDB({ region })
    const DomainName = await new this()._domain()
    const SelectExpression = `select * from \`${DomainName}\``
    const data = await DB.select({ SelectExpression }).promise()
    return data.Items.map(item => Shrimp._deserialize(this, item.Attributes))
  }

  /**
   * Remove ALL shrimp objects in the database (one-by-one). Returns the number
   * of removed items.
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function removeAllTodos() {
   *   await Todo.Clear()
   * }
   * ```
   */
  static async Clear<T extends Shrimp>(): Promise<number> {
    const all = await this.All()
    all.forEach(async item => await item.remove())
    return all.length
  }

  /**
   * Directly create a new object from parameters, save it and then return it.
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function addTodoToList() {
   *   const todo = await Todo.Create({ text: 'buy milk', done: false })
   *   return todo
   * }
   * ```
   *
   * @param this prefilled by typescript, skip this param!
   * @param data key-value object of your data, eg.: `{ text: 'stuff' }`
   */
  static async Create<T extends Shrimp>(this: ISelf<T>, data): Promise<T> {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  /**
   * Fetch an object from the database by [[_id]] and return it.
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function getFavoriteTodo() {
   *   const todo = await Todo.Find('nYrnfYEv')
   *   return todo
   * }
   * ```
   *
   * @param this prefilled by typescript, skip this param!
   * @param id [[_id]] of the desired shrimp object
   */
  static async Find<T extends Shrimp>(this: ISelf<T>, id: string): Promise<T> {
    const DB = new SimpleDB({ region })
    const DomainName = await new this()._domain()
    const data = await DB.getAttributes({ DomainName, ItemName: id }).promise()
    if (data && data.Attributes) {
      return Shrimp._deserialize(this, data.Attributes)
    } else {
      return undefined
    }
  }

  /**
   * Remove a shrimp from the database by [[_id]]
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function deleteSpecificTodo() {
   *   await Todo.Remove('nYrnfYEv')
   * }
   * ```
   *
   * @param id [[_id]] of the desired shrimp object
   */
  static async Remove<T extends Shrimp>(id: string): Promise<boolean> {
    const instance = await this.Find(id)
    return instance ? instance.remove() : false
  }

  // transform all model fields into a SimpleDB AttributeList
  private static _serialize<T extends Shrimp>(instance: T) {
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
  private static _deserialize<T extends Shrimp>(
    self: ISelf<T>,
    attrs: SimpleDB.AttributeList
  ): T {
    const instance = new self()
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

  // auto-managed field: when was this object created (unix timestamp)
  @field private createdAt: number = null

  // auto-managed field: primary key of the object (kind of uuid)
  @field private id: string = null

  // auto-managed field: when was this object updated last
  @field private updatedAt: number = null

  /**
   * Accessor for the auto-managed field `id`, which is created during
   * the first persistance operation (like: [[save]]) and can be used
   * everywhere you need unique identifiers. It is short and URL-friendly.
   *
   * The algorithm used is a [shortId](https://www.npmjs.com/package/shortid).
   */
  get _id(): string {
    return this.id
  }

  /**
   * Accessor for the auto-managed field `createdAt`, which is created during
   * the first persistance operation (like: [[save]]) and holds the date of the
   * first time the object was saved.
   *
   * While the underlying `createdAt` property is stored as an unix timestamp,
   * this accessor automatically parses the timestamp and returns a proper Date.
   */
  get _createdAt(): Date {
    return this.createdAt ? new Date(this.createdAt) : null
  }

  /**
   * Accessor for the auto-managed field `updatedAt`, which is created during
   * the first persistance operation (like: [[save]]) and holds the date of the
   * last time the object was saved/updated.
   *
   * While the underlying `updatedAt` property is stored as an unix timestamp,
   * this accessor automatically parses the timestamp and returns a proper Date.
   */
  get _updatedAt(): Date {
    return this.updatedAt ? new Date(this.updatedAt) : null
  }

  /**
   * Accessor for the machine-usable and human-readable name of the shrimp at
   * runtime, which is used for internal things like database table names.
   */
  @Memoize()
  get _name(): string {
    return this.constructor.name
  }

  /**
   * Method for the machine-usable and human-readable domain name for
   * SimpleDB. This will be used for AWS CloudFormation. It is necessary to
   * request the list of domains at runtime and pick the correct one, since
   * CloudFormation will append a random hash to the domain name on deployment.
   */
  @Memoize()
  async _domain(): Promise<string> {
    const DB = new SimpleDB({ region })
    const { DomainNames } = await DB.listDomains().promise()
    return find(DomainNames, domainName => {
      const [appName, stageName, shrimpName, hash] = domainName.split('-')
      return appName === pkg.name && shrimpName === this._name
    })
  }

  /**
   * Accessor to the types of all properties of the shrimp at runtime.
   * The returned object will have a structure like `{[fieldName]: fieldType}`.
   *
   * Uses some dark magic (experimental decorators + reflect-metadata) under
   * the hood, this is the reason why every data field must have a decorator.
   * _(The decorator itself doesn't need to do anything, there just must be one
   * present at all.)_
   */
  @Memoize()
  get _interface(): { [fieldName: string]: string } {
    const result = {}
    for (const key of Object.keys(this)) {
      const type = Reflect.getMetadata('design:type', this, key)
      if (type && type.name) {
        result[key] = type.name.toLowerCase()
      }
    }
    return result
  }

  /**
   * Get a list of fields from a derived shrimp. In other words: a list of
   * fields you defined in your shrimp subclass.
   */
  @Memoize()
  get _ownFields(): string[] {
    const whitelist = new Shrimp()
    return Object.keys(this._interface).filter(key => !(key in whitelist))
  }

  /**
   * Accessor for a list of current type errors. You can check at runtime
   * (whenever you want) if the current shrimp has any type errors and which
   * properties have the wrong type as value.
   * To only check if there is _any error at all_, use the convenient
   * [[_isValid]] accessor.
   */
  get _errors(): string[] {
    const itf = this._interface
    return this._ownFields
      .map(key => (typeof this[key] !== itf[key] ? key : false))
      .filter(key => key) as string[]
  }

  /**
   * Accessor for a quick typecheck. Uses [[_errors]] under the hood and checks
   * that the list of current type errors is empty.
   * Any persisting operations (like [[save]]) will check this accessor before
   * doing anything, enforcing data type safety at runtime.
   */
  get _isValid(): boolean {
    return this._errors.length <= 0
  }

  /**
   * Remove the object, deleting it from the database. Returns true if the
   * deletion was successful or false if nothing was deleted.
   */
  async remove(): Promise<boolean> {
    if (!this._id) {
      return false
    }
    const DB = new SimpleDB({ region })
    const DomainName = await this._domain()
    await DB.deleteAttributes({ DomainName, ItemName: this._id }).promise()
    return true
  }

  /**
   * Persists a shrimp object into the database. Will check [[_isValid]] first,
   * then update the managed fields (`id`, `createdAt`, `updatedAt`) and finally
   * return itself to allow chaining further operations.
   *
   * Creates a new database item on fresh objects or updates already existing
   * ones, depending on the state of the managed fields.
   *
   * Example:
   *
   * ```typescript
   * import { field, Shrimp } from '@seagull/core'
   *
   * class Todo extends Shrimp {
   *   @field text: string = ''
   *   @field done: boolean = false
   * }
   *
   * async function addNewTodo(text: string) {
   *   const todo = new Todo()
   *   todo.text = text
   *   await todo.save()
   *   return todo
   * }
   */
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
    const DomainName = await this._domain()
    const ItemName = this._id
    const Attributes = Shrimp._serialize(this)
    const DB = new SimpleDB({ region })
    const params = { Attributes, DomainName, ItemName }
    await DB.putAttributes(params).promise()
    return this
  }
}
