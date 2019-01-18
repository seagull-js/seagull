import { Mock } from '@seagull/mock'
import * as AWSMock from 'aws-sdk-mock'
import * as fs from 'fs'
import * as path from 'path'

type RequestObjectMock<T> = {
  promise(): Promise<T>
}

/**
 * when activated, redirect all calls from the AWS SDK of S3 to the S3 shim
 * implementation, which operates on a local folder instead.
 */
export class S3MockMem implements Mock {
  /**
   * this is the place where calls to s3 buckets will be redirected to
   */
  storage: { [Bucket: string]: { [Key: string]: any } } = {}

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
    this.storage = {}
  }

  /**
   * delete a file from the bucket
   */
  deleteObject = (Input: import('aws-sdk').S3.DeleteObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    delete this.storage[Input.Bucket][Input.Key]
    const result = {} as import('aws-sdk').S3.DeleteObjectOutput
    return this.result(cb, result)
  }

  /**
   * read a file from the bucket
   */
  getObject = (Input: import('aws-sdk').S3.GetObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    const Body = this.storage[Input.Bucket][Input.Key]
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
    const keys = Object.keys(this.storage[Input.Bucket])
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
    this.storage[Input.Bucket][Input.Key] = Input.Body
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
    this.storage[name] = this.storage[name] || {}
  }
}
