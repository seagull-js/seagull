import { InputLogEvents, Timestamp } from 'aws-sdk/clients/cloudwatchlogs'
import * as moment from 'moment'

export type LogLevel = 'info' | 'debug' | 'warn' | 'error'

export interface AddLogRequest {
  logStreamName: string
  log: any
  logLevel?: LogLevel
  sequenceToken?: string
}

export interface GetLogsRequest {
  logGroupName?: string
  logStreamName: string
  startTime?: Timestamp
  endTime?: Timestamp
  nextToken?: string
  limit?: number
  startFromHead?: boolean
}

export interface CreateStreamRequest {
  logStreamName: string
}

export interface WriteLogRequest {
  logStreamName: string
  log: any
  logLevel?: LogLevel
}

export interface WriteLogsRequest {
  logStreamName: string
  logs: any[]
  logLevel?: LogLevel
}

export interface WriteLogResponse {
  logStreamName: string
  nextSequenceToken: string
  rejectedLogEventsInfo?: object
}

export interface DescribeLogStreamsRequest {
  logGroupName?: string
  logStreamNamePrefix: string
  orderBy?: 'LogStreamName' | 'LastEventTime'
  descending?: boolean
  nextToken?: string
  limit?: number
}

export function getRandomSequenceToken() {
  let token = ''
  for (let i = 0; i < 56; i++) {
    const x = Math.floor(Math.random() * 10)
    token = `${token}${x}`
  }

  return token
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

// helper function for sending frontend logs to the logging route
export async function addLog(
  logRoute: string,
  log: AddLogRequest
): Promise<WriteLogResponse> {
  const rawResponse = await fetch(logRoute, {
    body: JSON.stringify(log),
    headers,
    method: 'POST',
  })

  return await rawResponse.json()
}

// helper function for creating new logging streams
export async function createStream(
  logRoute: string,
  streamName: string
): Promise<string> {
  const stream: CreateStreamRequest = {
    logStreamName: streamName,
  }
  const rawResponse = await fetch(logRoute, {
    body: JSON.stringify(stream),
    headers,
    method: 'POST',
  })

  return await rawResponse.json()
}

// helper function for getting logs in the frontend
export async function getLog(
  logRoute: string,
  log: GetLogsRequest
): Promise<any[]> {
  const rawResponse = await fetch(logRoute, {
    body: JSON.stringify(log),
    headers,
    method: 'POST',
  })

  return await rawResponse.json()
}

export function mapLogToEvent(log: any, logLevel?: LogLevel): InputLogEvents {
  const level = logLevel || 'info'
  return [
    {
      message: `[${level}] ${JSON.stringify(log)}`,
      timestamp: moment().valueOf(),
    },
  ]
}
