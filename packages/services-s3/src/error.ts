import { BasicError } from '@seagull/libraries'
import { AWSError } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'

export class S3Error extends BasicError {
  constructor(
    message: string,
    public details: PromiseResult<PutObjectOutput, AWSError>
  ) {
    super('S3Error', message)
  }
}
