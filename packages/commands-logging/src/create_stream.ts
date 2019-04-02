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
export class CreateStream extends Command<string> {
  logStreamName: string
  logGroupName: string
  CWL = new AWS.CloudWatchLogs({
    credentials: AWS.config.credentials,
    region: 'eu-central-1',
  })

  executeCloud = this.exec.bind(this, this.CWL)
  executePure = this.exec.bind(this, CWLSandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.exec.bind(this, new CWLMockFS('/tmp/.data') as any)

  constructor(logStreamName: string) {
    super()
    this.logGroupName = `/${getAppName()}/data-log`
    this.logStreamName = createStreamName(logStreamName)
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
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
      })
      .promise()

    return this.logStreamName
  }
}

function createStreamName(customName: string) {
  const hash = Math.random()
    .toString(36)
    .substring(7)
  const time = moment.utc()
  return `${customName}-${time.format()}-${hash}`.replace(/(\*)|(:)/g, '-')
}
