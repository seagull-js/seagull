import { Command } from '@seagull/commands'
import { getAppName, mapLogToEvent, WriteLogRequest } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  PutLogEventsRequest,
  PutLogEventsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as moment from 'moment'
import { CWLSandbox } from './logging_sandbox'

/**
 * Command to write log object to cloudwatch
 */
export class WriteLog extends Command<
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

  constructor(params: WriteLogRequest) {
    super()
    const events = mapLogToEvent(params.log, params.logLevel)
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

    return result
  }
}

function createStreamName(customName: string) {
  const hash = Math.random()
    .toString(36)
    .substring(7)
  const time = moment.utc()
  return `${customName}-${time.format()}-${hash}`.replace(/(\*)|(:)/g, '-')
}
