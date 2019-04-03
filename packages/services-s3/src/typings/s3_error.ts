import { Typings } from '@seagull/libraries'
import { AWSError } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'

export interface S3Error extends Typings.BasicError {
  message: string
  details: PromiseResult<PutObjectOutput, AWSError>
}
