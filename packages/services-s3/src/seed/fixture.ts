import { AWSError, HttpResponse, Request, Response } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'
import * as _ from 'lodash'

export type ListFilesFixture = string[]

export type GetFileFixture = string

export interface HttpResponseFixture {
  body: string | Buffer | Uint8Array
  headers: {
    [key: string]: string
  }
  statusCode: number
  statusMessage: string
  streaming: boolean
}

export interface ResponseFixture<D, E> {
  data: D | void
  error: E | void
  requestId: string
  redirectCount: number
  retryCount: number
  httpResponse: HttpResponseFixture
}

export interface PutFileFixture extends PutObjectOutput {
  $response: ResponseFixture<PutObjectOutput, AWSError>
  $requestData: string
}

// TODO: move to Fixture class
export const createResponse = (
  fixture: PutFileFixture
): PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError> => {
  const httpResponse = new HttpResponse()
  Object.assign(httpResponse, fixture.$response.httpResponse)

  const response = new Response<AWS.S3.PutObjectOutput, AWS.AWSError>()
  Object.assign(response, fixture.$response)

  response.httpResponse = httpResponse
  fixture.$response = response

  return fixture as any
}
