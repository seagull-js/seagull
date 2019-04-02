import { Command } from '@seagull/commands'
import { getAppName } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  InputLogEvents,
  PutLogEventsRequest,
  PutLogEventsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as moment from 'moment'
import { LogLevel, Message } from './index'
import { CWLSandbox } from './logging_sandbox'

/**
 * Command to write log object to cloudwatch
 */
export class AddLog extends Command<
  PromiseResult<PutLogEventsResponse, AWS.AWSError>
> {
  params: PutLogEventsRequest
  CWL = new AWS.CloudWatchLogs({
    credentials: AWS.config.credentials,
    region: 'eu-central-1',
  })

  executeCloud = this.exec.bind(this, this.CWL)
  executePure = this.exec.bind(this, CWLSandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.exec.bind(this, new CWLMockFS('/tmp/.data') as any)

  constructor(
    existingStreamName: string,
    log: Message,
    sequenceToken?: string,
    logLevel?: LogLevel
  ) {
    super()
    const events = mapLogToEvent(log, logLevel)
    this.params = {
      logEvents: events,
      logGroupName: `/${getAppName()}/data-log`,
      logStreamName: existingStreamName,
      sequenceToken,
    }
  }

  async execute() {
    return this.executeHandler()
  }

  async revert() {
    return undefined as any
  }

  private async exec(client: AWS.CloudWatchLogs) {
    const result = await client.putLogEvents(this.params).promise()

    return Object.assign(result, { logStreamName: this.params.logStreamName })
  }
}

function mapLogToEvent(log: Message, logLevel?: LogLevel): InputLogEvents {
  const level = logLevel || 'info'
  return [
    {
      message: `[${level}] ${JSON.stringify(log)}`,
      timestamp: moment().valueOf(),
    },
  ]
}
