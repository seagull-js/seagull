import { Command } from '@seagull/commands'
import { getCurrentWorkingDirectoryFolder as cwdf } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  PutLogEventsRequest,
  PutLogEventsResponse,
  Timestamp,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as moment from 'moment'
import { CWLSandbox } from './logging_sandbox'

interface Log {
  message: string | object | number
  timestamp?: Timestamp
}

interface WriteLogRequest {
  logStreamName: string
  logs: Log[]
}

/**
 * Command to write log object to cloudwatch
 */
export class WriteLog extends Command<
  PromiseResult<PutLogEventsResponse, AWS.AWSError>
> {
  params: PutLogEventsRequest
  CWL = new AWS.CloudWatchLogs({ region: process.env.AWS_REGION })

  executeCloud = this.exec.bind(this, this.CWL)
  executePure = this.exec.bind(this, CWLSandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.exec.bind(this, new CWLMockFS('/tmp/.data') as any)

  constructor(params: WriteLogRequest) {
    super()
    const events = params.logs.map(mapLogToEvent)
    this.params = {
      logEvents: events,
      logGroupName: cwdf(),
      logStreamName: params.logStreamName,
    }
  }

  async execute() {
    return this.executeHandler()
  }

  async revert() {
    return undefined as any
  }

  private async exec(client: AWS.CloudWatchLogs) {
    return await client.putLogEvents(this.params).promise()
  }
}

function mapLogToEvent(log: Log) {
  return {
    message: JSON.stringify(log.message),
    timestamp: log.timestamp || moment().unix(),
  }
}
