import { IMode } from '@seagull/mode'
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
  ) => Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>>
  deleteFile: (
    bucketName: string,
    filePath: string
  ) => Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>>
}
