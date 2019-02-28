import { Command } from '@seagull/commands'
import { getAppName } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  GetLogEventsRequest,
  GetLogEventsResponse,
  Timestamp,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import { CWLSandbox } from './logging_sandbox'

interface GetLogsRequest {
  logGroupName?: string
  logStreamName: string
  startTime?: Timestamp
  endTime?: Timestamp
  nextToken?: string
  limit?: number
  startFromHead?: boolean
}
/**
 * Command to read log object from cloudwatch
 */
export class ReadLog extends Command<
  PromiseResult<GetLogEventsResponse, AWS.AWSError>
> {
  params: GetLogEventsRequest
  result?: GetLogEventsResponse
  CWL = new AWS.CloudWatchLogs({
    credentials: AWS.config.credentials,
    region: 'eu-central-1',
  })

  executeCloud = this.exec.bind(this, this.CWL)
  executePure = this.exec.bind(this, CWLSandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.exec.bind(this, new CWLMockFS('/tmp/.data') as any)

  constructor(params: GetLogsRequest) {
    super()
    const groupName = { logGroupName: params.logGroupName || getAppName() }
    this.params = { ...params, ...groupName }
  }

  async execute() {
    return this.executeHandler()
  }

  async revert() {
    return undefined as any
  }

  getOriginalLog(): any {
    if (this.result) {
      const events = this.result.events!
      const original = events.map(event => {
        const arr = event.message!.split(' ')
        arr.shift()
        return JSON.parse(arr.join(' '))
      })

      return original.length === 1 ? original[0] : original
    } else {
      throw new Error('execute ReadLog first before transform the result')
    }
  }

  private async exec(client: AWS.CloudWatchLogs) {
    const result = await client.getLogEvents(this.params).promise()
    this.result = result
    return result
  }
}
