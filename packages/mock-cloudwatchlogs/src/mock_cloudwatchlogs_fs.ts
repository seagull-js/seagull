import {
  createFolderRecursive,
  getRandomSequenceToken,
} from '@seagull/libraries'
import { Mock } from '@seagull/mock'
import * as AWSMock from 'aws-sdk-mock'
import {
  DescribeLogStreamsRequest,
  DescribeLogStreamsResponse,
} from 'aws-sdk/clients/cloudwatchlogs'
import * as fs from 'fs'
import * as moment from 'moment'
import * as pathModule from 'path'

type PutLogRequest = AWS.CloudWatchLogs.PutLogEventsRequest
type PutLogResponse = AWS.CloudWatchLogs.PutLogEventsResponse
type GetLogRequest = AWS.CloudWatchLogs.GetLogEventsRequest
type GetLogResponse = AWS.CloudWatchLogs.GetLogEventsResponse
type CreateLogStreamRequest = AWS.CloudWatchLogs.CreateLogStreamRequest

/**
 * when activated, redirect all calls from the AWS SDK of CloudWatchLogs to the CloudWatchLogs mock
 * implementation, which operates on a local folder instead.
 */
export class CWLMockFS implements Mock {
  /**
   * When true, save/load the state of storage to local disk
   */
  localFolder: string
  private fsModule: typeof fs

  constructor(localFolder: string, fsModule = fs) {
    this.localFolder = localFolder
    this.fsModule = fsModule
  }

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    AWSMock.mock('CloudWatchLogs', 'putLogEvents', this.putLogEvents)
    AWSMock.mock('CloudWatchLogs', 'getLogEvents', this.getLogEvents)
    AWSMock.mock('CloudWatchLogs', 'createLogStream', this.createLogStream)
    AWSMock.mock(
      'CloudWatchLogs',
      'describeLogStreams',
      this.describeLogStreams
    )
    return this
  }

  /**
   * restore original S3 behavior
   */
  deactivate = () => {
    AWSMock.restore('CloudWatchLogs')
    return this
  }

  /**
   * resets internal s3 state
   */
  reset = () => {
    this.deleteFolderRecursive(this.localFolder)
  }

  /**
   * write a file into the bucket
   */
  putLogEvents = (Input: PutLogRequest, cb: any) => {
    let existingLogs: any[] = []
    Input.logGroupName = this.formatGroupName(Input.logGroupName)
    this.ensureLogGroup(Input.logGroupName)
    const path = this.getEncodedPath(Input)
    if (this.fsModule.existsSync(path)) {
      const data = this.fsModule.readFileSync(path, 'utf-8')
      existingLogs = existingLogs.concat(JSON.parse(data))
    }
    const logs = existingLogs.concat(Input.logEvents)
    const content = JSON.stringify(logs)
    this.fsModule.writeFileSync(path, `${content}\n`, 'utf-8')
    const result = {
      logStreamName: Input.logStreamName,
      nextSequenceToken: getRandomSequenceToken(),
    }
    return this.result(cb, result)
  }

  getLogEvents = (Input: GetLogRequest, cb: any) => {
    Input.logGroupName = this.formatGroupName(Input.logGroupName)
    this.ensureLogGroup(Input.logGroupName)
    const result: GetLogResponse = {}
    let events = []
    const path = this.getEncodedPath(Input)
    if (this.fsModule.existsSync(path)) {
      const data = this.fsModule.readFileSync(path, 'utf-8')
      events = JSON.parse(data)
    }

    result.events = events
    return this.result(cb, result)
  }

  createLogStream = (params: CreateLogStreamRequest, cb: any) => {
    const hash = Math.random()
      .toString(36)
      .substring(7)
    const time = moment.utc()
    const result = `${params.logStreamName}-${time.format()}-${hash}`.replace(
      /(\*)|(:)/g,
      '-'
    )
    return this.result(cb, result)
  }

  describeLogStreams = (Input: DescribeLogStreamsRequest, cb: any) => {
    Input.logGroupName = this.formatGroupName(Input.logGroupName)
    this.ensureLogGroup(Input.logGroupName)
    const result: DescribeLogStreamsResponse = {}
    const path = this.getEncodedFolderPath(Input)
    const list = this.fsModule.readdirSync(path)
    let streams = list.map(stream => {
      return { logStreamName: stream }
    })

    if (Input.logStreamNamePrefix) {
      streams = streams.filter(stream =>
        stream.logStreamName.startsWith(Input.logStreamNamePrefix!)
      )
    }

    result.logStreams = streams

    return this.result(cb, result)
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
    const dir = pathModule.join(this.localFolder, name)
    const dirExists = this.fsModule.existsSync(dir)
    return !dirExists && createFolderRecursive(dir, this.fsModule)
  }

  private getEncodedPath(Input: {
    logGroupName: string
    logStreamName: string
  }) {
    return pathModule.join(
      this.localFolder,
      encodeURIComponent(Input.logGroupName),
      encodeURIComponent(Input.logStreamName)
    )
  }

  private getEncodedFolderPath(Input: { logGroupName: string }) {
    return pathModule.join(
      this.localFolder,
      encodeURIComponent(Input.logGroupName)
    )
  }

  private deleteFolderRecursive(path: string) {
    if (this.fsModule.existsSync(path)) {
      this.fsModule.readdirSync(path).forEach((file, index) => {
        const curPath = path + '/' + file
        if (this.fsModule.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath)
        } else {
          this.fsModule.unlinkSync(curPath)
        }
      })
      this.fsModule.rmdirSync(path)
    }
  }

  private formatGroupName(name: string) {
    let newName = name.replace(/(\/)/g, '-')
    if (newName.startsWith('-')) {
      newName = newName.substring(1)
    }

    return newName
  }
}
