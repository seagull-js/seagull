/**
 * Import the SDK and prepare a fresh DynamoDB client instance
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ReadOnlyConfig } from '../util'

import OfflineClient from './ddb_offline'
const client =
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev'
    ? new OfflineClient()
    : new DynamoDB.DocumentClient({
        convertEmptyValues: true,
        region: ReadOnlyConfig.config.region,
      })

/**
 * Delete a single item by hash key.
 */
export type DeleteItemInput = DynamoDB.DocumentClient.DeleteItemInput
export type DeleteItemOutput = DynamoDB.DocumentClient.DeleteItemOutput

// core function promisified: Get a single item by hash key
export async function remove(
  params: DeleteItemInput
): Promise<DeleteItemOutput> {
  return client.delete(params).promise()
}

// convenience function: Get a single item by hash key
export async function removeItem(
  table: string,
  key: string,
  value: string
): Promise<boolean> {
  const params = {
    Key: {
      [key]: value,
    },
    TableName: table,
  }
  try {
    await remove(params)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get a single item by hash key.
 */
export type GetItemInput = DynamoDB.DocumentClient.GetItemInput
export type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput

// core function promisified: Get a single item by hash key
export async function get(params: GetItemInput): Promise<GetItemOutput> {
  return client.get(params).promise()
}

// convenience function: Get a single item by hash key
export async function getItem(
  table: string,
  key: string,
  value: string
): Promise<any> {
  const params = {
    Key: {
      [key]: value,
    },
    TableName: table,
  }
  const result = await get(params)
  // tslint:disable-next-line:no-console
  return result.Item
}

/**
 * Put a single item into a table
 */
export type PutItemInput = DynamoDB.DocumentClient.PutItemInput
export type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput

// core function promisified: Put a single item into a table
export async function put(params: PutItemInput): Promise<PutItemOutput> {
  return client.put(params).promise()
}

// convenience function: Put a single item into a table
export async function putItem(table: string, item: any): Promise<any> {
  return put({ TableName: table, Item: item })
}

/**
 * Query a table by a given index and key/value
 */
export type QueryInput = DynamoDB.DocumentClient.QueryInput
export type QueryOutput = DynamoDB.DocumentClient.QueryOutput

// core function promisified: Query a table by a given index and key/value
export async function query(params: QueryInput): Promise<QueryOutput> {
  return client.query(params).promise()
}

// convenience function: Put a single item into a table
export async function queryItems(
  table: string,
  key: string,
  value: string,
  index?: string
): Promise<any> {
  const params: QueryInput = {
    ExpressionAttributeNames: {
      '#key': key,
    },
    ExpressionAttributeValues: {
      ':value': value,
    },
    KeyConditionExpression: '#key = :value',
    TableName: table,
  }
  if (index) {
    params.IndexName = index
  }
  const result = await query(params)
  return result.Items
}

/**
 * Scan a table
 */
export type ScanInput = DynamoDB.DocumentClient.ScanInput
export type ScanOutput = DynamoDB.DocumentClient.ScanOutput

// core function promisified: scan a complete table and return all items
export async function scan(params: ScanInput): Promise<ScanOutput> {
  return client.scan(params).promise()
}

// convenience function: get all items in table
export async function scanItems(table: string): Promise<any> {
  const params: ScanInput = { TableName: table }
  const result = await scan(params)
  return result.Items
}
