import { IMode } from '@seagull/mode'
import * as AWS from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export class S3Edge extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'cloud' }
}
