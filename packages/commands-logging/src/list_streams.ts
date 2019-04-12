import { Command } from '@seagull/commands'
import {
  DescribeLogStreamsRequest as GetLogStreamsRequest,
  getAppName,
} from '@seagull/libraries'
import { CWLMockFS } from '@seagull/mock-cloudwatchlogs'
import * as AWS from 'aws-sdk'
import {
  DescribeLogStreamsRequest,
  DescribeLogStreamsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import { PromiseResult } from 'aws-sdk/lib/request'
import { CWLSandbox } from './logging_sandbox'

/**
 * Command to read a certain log stream from cloudwatch
 */
export class ListStreams extends Command<
  PromiseResult<DescribeLogStreamsResponse, AWS.AWSError>
> {
  params: DescribeLogStreamsRequest
  CWL = new AWS.CloudWatchLogs({
    credentials: AWS.config.credentials,
    region: 'eu-central-1',
  })

  executeCloud = this.exec.bind(this, this.CWL)
  executePure = this.exec.bind(this, CWLSandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.exec.bind(this, new CWLMockFS('/tmp/.data') as any)

  constructor(params: GetLogStreamsRequest) {
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

  private async exec(client: AWS.CloudWatchLogs) {
    const result = await client.describeLogStreams(this.params).promise()

    return result
  }
}
