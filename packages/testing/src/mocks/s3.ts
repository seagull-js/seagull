import * as AWSMock from 'aws-sdk-mock'
import { Mock } from './mock'

/**
 * when activated, redirect all calls from the AWS SDK of S3 to the S3 shim
 * implementation, which operates on a local folder instead.
 */
export class S3 implements Mock {
  /**
   * this is the place where calls to s3 buckets will be redirected to
   */
  storage: { [Bucket: string]: { [Key: string]: any } } = {}

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    const s3 = new S3()
    AWSMock.mock('S3', 'getObject', s3.getObject)
    AWSMock.mock('S3', 'putObject', s3.putObject)
    AWSMock.mock('S3', 'deleteObject', s3.deleteObject)
    return s3
  }

  /**
   * restore original S3 behavior
   */
  deactivate = () => {
    AWSMock.restore('S3')
  }

  /**
   * delete a file from the bucket
   */
  deleteObject = (Input: import('aws-sdk').S3.DeleteObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    delete this.storage[Input.Bucket][Input.Key]
    const result: import('aws-sdk').S3.DeleteObjectOutput = {}
    cb(null, result)
  }

  /**
   * read a file from the bucket
   */
  getObject = (Input: import('aws-sdk').S3.GetObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    const Body = this.storage[Input.Bucket][Input.Key]
    const result: import('aws-sdk').S3.GetObjectOutput = { Body }
    cb(null, result)
  }

  /**
   * write a file into the bucket
   */
  putObject = (Input: import('aws-sdk').S3.PutObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    this.storage[Input.Bucket][Input.Key] = Input.Body
    const result: import('aws-sdk').S3.PutObjectOutput = {}
    cb(null, result)
  }

  // little helper to ensure that the "bucket" key exists in [[storage]]
  private ensureBucket = (name: string) => {
    this.storage[name] = this.storage[name] || {}
  }
}
