import * as dashify from 'dashify'
import 'reflect-metadata'
import { generate as newID } from 'shortid'
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
  @field private id: string = null

  get _name(): string {
    return dashify(this.constructor.name)
  }

  get _id(): string {
    return this.id
  }

  get _interface(): any {
    const result = {}
    for (const key of Object.keys(this)) {
      const type = Reflect.getMetadata('design:type', this, key)
      if (type && type.name) {
        result[key] = type.name
      }
    }
    return result
  }

  async save(): Promise<this> {
    if (!this.id) {
      this.id = newID()
    }
    // do DB stuff
    return this
  }
}
