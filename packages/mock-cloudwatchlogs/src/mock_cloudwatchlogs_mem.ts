import { getRandomSequenceToken } from '@seagull/libraries'
import { Mock } from '@seagull/mock'
import * as AWS from 'aws-sdk'
import * as AWSMock from 'aws-sdk-mock'

type PutLogRequest = AWS.CloudWatchLogs.PutLogEventsRequest
type PutLogResponse = AWS.CloudWatchLogs.PutLogEventsResponse
type GetLogRequest = AWS.CloudWatchLogs.GetLogEventsRequest
type GetLogResponse = AWS.CloudWatchLogs.GetLogEventsResponse
type LogEvents = AWS.CloudWatchLogs.InputLogEvents
type CreateLogStreamRequest = AWS.CloudWatchLogs.CreateLogStreamRequest

/**
 * when activated, redirect all calls from the AWS SDK of S3 to the S3 shim
 * implementation, which operates on a local folder instead.
 */
export class CWLMockMem implements Mock {
  /**
   * this is the place where calls to s3 buckets will be redirected to
   */
  storage: {
    [logGroupName: string]: { [logStreamName: string]: LogEvents }
  } = {}

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    AWSMock.mock('CloudWatchLogs', 'putLogEvents', this.putLogEvents)
    AWSMock.mock('CloudWatchLogs', 'getLogEvents', this.getLogEvents)
    AWSMock.mock('CloudWatchLogs', 'createLogStream', this.createLogStream)
    return this
  }

  /**
   * restore original CloudWatchLogs behavior
   */
  deactivate = () => {
    AWSMock.restore('CloudWatchLogs')
    return this
  }

  /**
   * resets internal s3 state
   */
  reset = () => {
    this.storage = {}
  }

  putLogEvents = (Input: PutLogRequest, cb: any) => {
    this.ensureLogGroup(Input.logGroupName)
    const existingLogs =
      this.storage[Input.logGroupName][Input.logStreamName] || []
    this.storage[Input.logGroupName][Input.logStreamName] = existingLogs.concat(
      Input.logEvents
    )
    const result = {
      logStreamName: Input.logStreamName,
      nextSequenceToken: getRandomSequenceToken(),
    }
    return this.result(cb, result)
  }

  getLogEvents = (Input: GetLogRequest, cb: any) => {
    this.ensureLogGroup(Input.logGroupName)
    const events = this.storage[Input.logGroupName][Input.logStreamName]
    const result: GetLogResponse = { events: events || [] }
    return this.result(cb, result)
  }

  createLogStream(params: CreateLogStreamRequest, cb: any) {
    return this.result(cb, null)
  }

  /**
   * Decides if a mocked AWS Result object or void (while calling the callback) should be returned
   */
  private result<Value>(cb: any, value: Value) {
    return cb ? (void cb(null, value) as void) : this.requestObject(value)
  }

  /**
   * Minimal mock for AWS Result
   */
  private requestObject<T>(result: T) {
    return {
      promise: async () => result,
    }
  }

  // little helper to ensure that the "bucket" key exists in [[storage]]
  private ensureLogGroup = (name: string) => {
    this.storage[name] = this.storage[name] || {}
  }
}
