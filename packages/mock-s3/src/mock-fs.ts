import { createFolderRecursive } from '@seagull/libraries'
import { Mock } from '@seagull/mock'
import * as AWSMock from 'aws-sdk-mock'
import * as fs from 'fs'
import * as pathModule from 'path'

type RequestObjectMock<T> = {
  promise(): Promise<T>
}

/**
 * when activated, redirect all calls from the AWS SDK of S3 to the S3 shim
 * implementation, which operates on a local folder instead.
 */
export class S3MockFS implements Mock {
  /**
   * When true, save/load the state of storage to local disk
   */
  localFolder: string

  constructor(localFolder: string) {
    this.localFolder = localFolder
  }

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    AWSMock.mock('S3', 'getObject', this.getObject)
    AWSMock.mock('S3', 'listObjectsV2', this.listObjectsV2)
    AWSMock.mock('S3', 'putObject', this.putObject)
    AWSMock.mock('S3', 'deleteObject', this.deleteObject)
    return this
  }

  /**
   * restore original S3 behavior
   */
  deactivate = () => {
    AWSMock.restore('S3')
    return this
  }

  /**
   * resets internal s3 state
   */
  reset = () => {
    this.deleteFolderRecursive(this.localFolder)
  }

  /**
   * delete a file from the bucket
   */
  deleteObject = (Input: import('aws-sdk').S3.DeleteObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    fs.unlinkSync(this.getEncodedPath(Input))
    const result = {} as import('aws-sdk').S3.DeleteObjectOutput
    return this.result(cb, result)
  }

  /**
   * read a file from the bucket
   */
  getObject = (Input: import('aws-sdk').S3.GetObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    const data = fs.readFileSync(this.getEncodedPath(Input), 'utf-8')
    const Body = JSON.parse(data)
    const result: import('aws-sdk').S3.GetObjectOutput = { Body }
    return this.result(cb, result)
  }

  /**
   * list all files from a bucket with optional prefix
   */
  listObjectsV2 = (
    Input: import('aws-sdk').S3.ListObjectsV2Request,
    cb: any
  ) => {
    this.ensureBucket(Input.Bucket)
    const prefix = Input.Prefix || ''
    const dir = pathModule.join(this.localFolder, Input.Bucket)
    const keys = fs.readdirSync(dir).map(decodeURIComponent)
    const list = prefix ? keys.filter(key => key.startsWith(prefix)) : keys
    const Contents = list.map(key => ({ Key: key }))
    const result: import('aws-sdk').S3.ListObjectsV2Output = { Contents }
    return this.result(cb, result)
  }

  /**
   * write a file into the bucket
   */
  putObject = (Input: import('aws-sdk').S3.PutObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    const content = JSON.stringify(Input.Body)
    fs.writeFileSync(this.getEncodedPath(Input), content, 'utf-8')
    const result: import('aws-sdk').S3.PutObjectOutput = {}
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
  private ensureBucket = (name: string) => {
    const dir = pathModule.join(this.localFolder, name)
    return !fs.existsSync(dir) && createFolderRecursive(dir)
  }

  private getEncodedPath({ Key, Bucket }: { Key: string; Bucket: string }) {
    return pathModule.join(this.localFolder, Bucket, encodeURIComponent(Key))
  }

  private deleteFolderRecursive(path: string) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = path + '/' + file
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
    }
  }
}
