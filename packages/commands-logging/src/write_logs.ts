import { Command } from '@seagull/commands'
import { getAppName, WriteLogsRequest } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  InputLogEvents,
  PutLogEventsRequest,
  PutLogEventsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as moment from 'moment'
import { LogLevel } from './index'
import { CWLSandbox } from './logging_sandbox'

/**
 * Command to write log object to cloudwatch
 */
export class WriteLogs extends Command<
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

  constructor(params: WriteLogsRequest) {
    super()
    const events = mapLogToEvents(params.logs, params.logLevel)
    this.params = {
      logEvents: events,
      logGroupName: `/${getAppName()}/data-log`,
      logStreamName: createStreamName(params.logStreamName),
    }
  }

  async execute() {
    return this.executeHandler()
  }

  async revert() {
    return undefined as any
  }

  private async exec(client: AWS.CloudWatchLogs) {
    await client
      .createLogStream({
        logGroupName: this.params.logGroupName,
        logStreamName: this.params.logStreamName,
      })
      .promise()

    const result = await client.putLogEvents(this.params).promise()

    return Object.assign(result, { logStreamName: this.params.logStreamName })
  }
}

function mapLogToEvents(logs: any[], logLevel?: LogLevel): InputLogEvents {
  const level = logLevel || 'info'
  return logs.map(logItem => {
    return {
      message: `[${level}] ${JSON.stringify(logItem)}`,
      timestamp: moment().valueOf(),
    }
  })
}

function createStreamName(customName: string) {
  const hash = Math.random()
    .toString(36)
    .substring(7)
  const time = moment.utc()
  return `${customName}-${time.format()}-${hash}`.replace(/(\*)|(:)/g, '-')
}
