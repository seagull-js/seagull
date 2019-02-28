import { Command } from '@seagull/commands'
import { getAppName } from '@seagull/libraries'
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

let sequenceToken: string | undefined

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
    const events = params.logs.map(mapLogToEvent)
    console.info('used sequenceToken', sequenceToken)
    this.params = {
      logEvents: events,
      logGroupName: getAppName(),
      logStreamName: createStreamName(params.logStreamName),
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
    const response = await client
      .createLogStream({
        logGroupName: this.params.logGroupName,
        logStreamName: this.params.logStreamName,
      })
      .promise()
    console.info('this.params', this.params)
    const result = await client.putLogEvents(this.params).promise()
    sequenceToken = result.nextSequenceToken
    console.info('response', response)
    console.info('result', result)

    return result
  }
}

function mapLogToEvent(log: Log) {
  return {
    message: JSON.stringify(log.message),
    timestamp: log.timestamp || moment().unix() * 1000,
  }
}

function createStreamName(customName: string) {
  const hash = Math.random()
    .toString(36)
    .substring(7)
  const time = moment.utc()
  return `${time.format()}-${customName}-${hash}`.replace(/(\*)|(:)/g, '-')
}
