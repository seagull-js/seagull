import { AWSError } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'

/**
 * S3 interface.
 */
export interface IS3 {
  listFiles: (bucketName: string, filePath?: string) => Promise<string[]>
  readFile: (bucketName: string, filePath: string) => Promise<string>
  writeFile: (
    bucketName: string,
    filePath: string,
    content: string
  ) => Promise<PromiseResult<PutObjectOutput, AWSError>>
  writeFiles: (
    bucketName: string,
    files: Array<{ path: string; content: string }>
  ) => Promise<Array<PromiseResult<PutObjectOutput, AWSError>>>
  deleteFile: (
    bucketName: string,
    filePath: string
  ) => Promise<PromiseResult<PutObjectOutput, AWSError>>
}
