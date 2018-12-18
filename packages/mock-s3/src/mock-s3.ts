import { Mock } from '@seagull/mock'
import * as AWSMock from 'aws-sdk-mock'
import * as fs from 'fs'
import * as path from 'path'

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
   * When true, save/load the state of storage to local disk
   */
  localFolder: string | undefined

  constructor(localFolder?: string) {
    this.localFolder = localFolder
    this.loadFromDisk()
  }

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    AWSMock.mock('S3', 'getObject', this.getObject)
    AWSMock.mock('S3', 'listObjectsV2', this.listObjects)
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
    this.loadFromDisk()
  }

  /**
   * delete a file from the bucket
   */
  deleteObject = (Input: import('aws-sdk').S3.DeleteObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    delete this.storage[Input.Bucket][Input.Key]
    this.synchronizeToDisk()
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
   * list all files from a bucket with optional prefix
   */
  listObjects = (Input: import('aws-sdk').S3.ListObjectsV2Request, cb: any) => {
    this.ensureBucket(Input.Bucket)
    const prefix = Input.Prefix || ''
    const keys = Object.keys(this.storage[Input.Bucket])
    const list = prefix ? keys.filter(key => key.startsWith(prefix)) : keys
    const Contents = list.map(key => ({ Key: key }))
    const result: import('aws-sdk').S3.ListObjectsV2Output = { Contents }
    cb(null, result)
  }

  /**
   * write a file into the bucket
   */
  putObject = (Input: import('aws-sdk').S3.PutObjectRequest, cb: any) => {
    this.ensureBucket(Input.Bucket)
    this.storage[Input.Bucket][Input.Key] = Input.Body
    this.synchronizeToDisk()
    const result: import('aws-sdk').S3.PutObjectOutput = {}
    cb(null, result)
  }

  // little helper to ensure that the "bucket" key exists in [[storage]]
  private ensureBucket = (name: string) => {
    this.storage[name] = this.storage[name] || {}
  }

  private loadFromDisk() {
    if (this.localFolder) {
      const filePath = path.join(this.localFolder, 's3.json')
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8')
        this.storage = JSON.parse(data)
      }
    }
  }

  private synchronizeToDisk() {
    if (this.localFolder) {
      if (!fs.existsSync(this.localFolder)) {
        fs.mkdirSync(this.localFolder)
      }
      const filePath = path.join(this.localFolder, 's3.json')
      const fileContent = JSON.stringify(this.storage)
      fs.writeFileSync(filePath, fileContent, 'utf-8')
    }
  }
}
