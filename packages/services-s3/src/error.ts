import { AWSError } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'

export interface S3Error extends PromiseResult<PutObjectOutput, AWSError> {
  message: string
}
