import { Command } from '@seagull/commands'
import { getAppName, GetLogsRequest } from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  GetLogEventsRequest,
  GetLogEventsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import { CWLSandbox } from './logging_sandbox'

/**
 * Command to read a certain log stream from cloudwatch
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
    const groupName = {
      logGroupName: params.logGroupName || `/${getAppName()}/data-log`,
    }
    this.params = { ...params, ...groupName }
  }

  async execute() {
    return this.executeHandler()
  }

  async revert() {
    return undefined as any
  }

  /**
   * get the original logs from a stream
   */
  getOriginalLog(): any[] {
    if (this.result) {
      const events = this.result.events!
      const original = events.map(event => {
        const arr = event.message!.split(' ')
        arr.shift()
        return JSON.parse(arr.join(' '))
      })

      return original
    } else {
      throw new Error('no data, execute ReadLog first')
    }
  }

  /**
   * get the original logs with timestamps from a stream
   */
  getOriginalLogWithTimestamps(): any[] {
    if (this.result) {
      const events = this.result.events!
      const original = events.map(event => {
        const arr = event.message!.split(' ')
        arr.shift()
        return {
          message: JSON.parse(arr.join(' ')),
          timestamp: event.timestamp,
        }
      })

      return original
    } else {
      throw new Error('no data, execute ReadLog first')
    }
  }

  private async exec(client: AWS.CloudWatchLogs) {
    const result = await client.getLogEvents(this.params).promise()
    this.result = result
    return result
  }
}
