import { IMode } from '@seagull/mode'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http (default) seed implementation.
 */
@injectable()
export class S3Seed extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }
}
