/**
 * Import the SDK and prepare a fresh DynamoDB client instance
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import OfflineClient from './ddb_offline'
const client =
  process.env.NODE_ENV === 'test'
    ? new OfflineClient()
    : new DynamoDB.DocumentClient({ region: 'eu-central-1', convertEmptyValues: true })

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
