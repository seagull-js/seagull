import { IMode } from '@seagull/mode'
import * as AWS from 'aws-sdk'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export class S3Seed extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'cloud' }
}
