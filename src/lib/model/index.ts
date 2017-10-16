import * as dashify from 'dashify'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
import * as DB from './ddb'
import field from './field'

/**
 * automatic ID generation for the underlying persistence implementation (DDB)
 */

/*
DynamoDbNewsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: rr-news
    AttributeDefinitions:
      - AttributeName: slug
        AttributeType: S
      - AttributeName: feedUrl
        AttributeType: S
      - AttributeName: createdDate
        AttributeType: S
    KeySchema:
      - AttributeName: slug
        KeyType: HASH
    ProvisionedThroughput:
      ReadCapacityUnits: 3
      WriteCapacityUnits: 3
    GlobalSecondaryIndexes:
    - IndexName: NewsUrlIndex
      KeySchema:
        - AttributeName: feedUrl
          KeyType: HASH
      Projection:
        ProjectionType: "ALL"
      ProvisionedThroughput:
        ReadCapacityUnits: 2
        WriteCapacityUnits: 3
    - IndexName: NewsCreatedDateIndex
      KeySchema:
        - AttributeName: createdDate
          KeyType: HASH
      Projection:
        ProjectionType: "ALL"
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 3
  */
export default class Model {
  static async create<T extends Model>(this: { new (): T }, data): Promise<T> {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  static async find<T extends Model>(this: { new (): T }, id: string): Promise<T> {
    const data = await DB.getItem(new this()._name, 'id', id)
    const instance: T = Object.assign(new this(), data)
    return instance
  }

  @field private id: string = ''

  get _name(): string {
    return dashify(this.constructor.name)
  }

  get _id(): string {
    return this.id
  }

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

  get _errors(): string[] {
    const itf = this._interface
    return Object.keys(itf).map(key => {
      return key !== 'id' && typeof this[key] !== itf[key] ? key : false
    }).filter(key => key) as string[]
  }

  get _isValid(): boolean {
    return this._errors.length <= 0
  }

  async save(): Promise<this> {
    if (!this._isValid) {
      const fields = this._errors.join(', ')
      throw new Error(`invalid fields for ${this._name}: ${fields}`)
    }
    if (!this.id) {
      this.id = newID()
    }
    await DB.putItem(this._name, this)
    return this
  }
}
